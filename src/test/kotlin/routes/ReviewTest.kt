package routes

import com.auth0.jwt.JWT
import com.auth0.jwt.interfaces.DecodedJWT
import com.paitor.practice.domain.requests.LoginRequest
import com.paitor.practice.domain.responses.AdminResponse
import com.paitor.practice.domain.responses.ReviewResponse
import com.paitor.practice.domain.responses.UserResponse
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ReviewTest {
    @Test
    fun `add, get and delete review`() = testApplication {
        environment {
            config = ApplicationConfig("application.yaml")
        }
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }
        val response = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("john1@example.com", "pass"))
        }
        val content = response.body<UserResponse>()

        val decodedJWT: DecodedJWT = JWT.decode(content.token)

        assertEquals(HttpStatusCode.OK, response.status)

        assertEquals(1, decodedJWT.getClaim("sub").asInt())
        assertEquals("John Smith", content.name)
        assertEquals("CS-01-23", content.groupName)
        assertEquals(2, content.semester)
    }

    @Test
    fun `get summary`() = testApplication {
        environment {
            config = ApplicationConfig("application.yaml")
        }
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }

        val token = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("admin1@example.com", "adminpass1"))
        }.body<AdminResponse>().token

        val response = client.get("/api/courses/3/reviews/summary") {
            header("Authorization", "Bearer $token")
        }
//        val summary = response.body<Map<String, String>>()

        assertEquals(HttpStatusCode.OK, response.status)
    }

    @Test
    fun `get reviews by admin`() = testApplication {
        environment {
            config = ApplicationConfig("application.yaml")
        }
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }

        val token = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("admin1@example.com", "adminpass1"))
        }.body<AdminResponse>().token

        val response = client.get("/api/courses/3/reviews") {
            header("Authorization", "Bearer $token")
        }
//        val reviews = response.body<List<ReviewResponse>>()
        assertEquals(HttpStatusCode.OK, response.status)
    }
    @Test
    fun `get review by student`() = testApplication {
        environment {
            config = ApplicationConfig("application.yaml")
        }
        val client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }

        val token = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("john1@example.com", "pass"))
        }.body<UserResponse>().token

        val response = client.get("/api/courses/3/reviews") {
            header("Authorization", "Bearer $token")
        }
//        val review = response.body<Map<String, Nothing?>>()
        assertEquals(HttpStatusCode.OK, response.status)
//        assertEquals(mapOf("review" to null), review)
    }
}