package com.paitor.practice.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.util.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import java.time.Duration
import java.time.Instant
import java.util.*

interface OverallGetter {
    suspend fun get(reviews: List<String>): String
}

class OverallGetterImpl(private val client: HttpClient, private val secretKey: String) : OverallGetter {
    private var token: AccessToken? = null

    override suspend fun get(reviews: List<String>): String {
        if (token == null || token?.let {
                // Время жизни токена 30 минут
                Duration.between(it.expiresAt, Instant.now()).toMinutes() > 28
            } == true) {
            val response: AccessTokenResponse = client.post(GET_TOKEN_URL) {
                contentType(ContentType.Application.FormUrlEncoded)

                headers {
                    appendAll(
                        "RqUID" to UUID.randomUUID().toString(),
                        HttpHeaders.Accept to "application/json",
                        HttpHeaders.Authorization to "Basic $secretKey",
                    )
                }
                setBody("scope=GIGACHAT_API_PERS")
            }.body()

            token = AccessToken(
                token = response.token,
                expiresAt = Instant.ofEpochMilli(response.expiresAt.toLong())
            )
        }
        val accessToken = requireNotNull(token).token
        val response = client.post(GET_ANSWER) {
            contentType(ContentType.Application.Json)
            headers {
                appendAll(
                    HttpHeaders.Authorization to "Bearer $accessToken",
                    HttpHeaders.Accept to "application/json",
                )
            }
            setBody(
                ChatRequest(
                    model = "GigaChat",
                    messages = listOf(Message(PROMPT)) + reviews.map { Message(it) },
                    stream = false,
                    repetition_penalty = 1.0
                )
            )
        }
        when (response.status) {
            HttpStatusCode.OK -> return (
                    Json.parseToJsonElement(response.bodyAsText()) as JsonObject)["choices"]
                ?.jsonArray?.firstOrNull()
                ?.jsonObject?.get("message")
                ?.jsonObject?.get("content")
                ?.jsonPrimitive?.takeIf { it.isString }?.content
                ?: throw IllegalStateException("Content not found")

            else -> throw Exception("Bad request status code: ${response.status}, body: ${response.bodyAsText()}")
        }
    }

    companion object {
        private const val GET_TOKEN_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
        private const val GET_ANSWER = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
        private const val PROMPT = """
            Ты получишь список отзывов студентов на определенный курс в вузе, составь summary для преподавателя, чего хотят студенты, что можно изменить. Отвечай на русском языке
        """
    }
}

data class AccessToken(val token: String, val expiresAt: Instant)

@Serializable
data class AccessTokenResponse(
    @SerialName("access_token") val token: String,
    @SerialName("expires_at") val expiresAt: String,
)

@Serializable
data class Message(val content: String, val role: String = "user")

@Serializable
data class ChatRequest(
    val model: String,
    val messages: List<Message>,
    val stream: Boolean = false,
    val repetition_penalty: Double = 1.0,
)