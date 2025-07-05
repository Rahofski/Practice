package routes

import com.auth0.jwt.JWT
import com.auth0.jwt.interfaces.DecodedJWT
import com.paitor.practice.domain.requests.LoginRequest
import com.paitor.practice.domain.responses.AdminResponse
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


class LogInTest {
    @Test
    fun `student log in success`() = testApplication {
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
    fun `student log in failure`() = testApplication {
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
            setBody(LoginRequest("john1@example.com", "wrong_pass"))
        }
        val response2 = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("wrong_mail@example.com", "pass"))
        }
        assertEquals(HttpStatusCode.Unauthorized, response.status)
        assertEquals(HttpStatusCode.Unauthorized, response2.status)
    }

    @Test
    fun `admin log in success`() = testApplication {
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
            setBody(LoginRequest("admin1@example.com", "adminpass1"))
        }
        val content = response.body<AdminResponse>()
        val decodedJWT: DecodedJWT = JWT.decode(content.token)

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(1, decodedJWT.getClaim("sub").asInt())
    }

    @Test
    fun `admin log in failure`() = testApplication {
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
            setBody(LoginRequest("admin1@example.com", "wrong_pass"))
        }
        val response2 = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest("wrong_mail@example.com", "pass"))
        }
        assertEquals(HttpStatusCode.Unauthorized, response.status)
        assertEquals(HttpStatusCode.Unauthorized, response2.status)
    }
}