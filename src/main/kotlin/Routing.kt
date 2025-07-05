package com.paitor.practice

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.paitor.practice.data.repository.*
import com.paitor.practice.domain.exceptions.DuplicateReviewException
import com.paitor.practice.domain.requests.LoginRequest
import com.paitor.practice.domain.requests.ReviewAddRequest
import com.paitor.practice.domain.responses.AdminResponse
import com.paitor.practice.domain.responses.ReviewResponse
import com.paitor.practice.domain.responses.UserResponse
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import java.util.*

fun Application.configureRouting(
    userRepository: UserRepository,
    adminRepository: AdminRepository,
    courseRepository: CourseRepository,
    reviewRepository: ReviewRepository,
    overallRepository: OverallRepository,
) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        post("/api/auth/login") {
            val (email, password) = call.receive<LoginRequest>()

            userRepository.logIn(email, password)?.let { user ->
//                val token = generateToken(user.id, arrayOf("student"))
                val token = generateUserTokenMudaka(user.id, user.name, user.groupName, user.semester)
                call.respond(
                    UserResponse(
                        token = token,
                        name = user.name,
                        groupName = user.groupName,
                        semester = user.semester
                    )
                )
            } ?: adminRepository.logIn(email, password)?.let { admin ->
//                val token = generateToken(admin.id, arrayOf("admin"))
                val token = generateAdminTokenMudaka(admin.id)
                call.respond(AdminResponse(token = token))
            } ?: call.respond(
                HttpStatusCode.Unauthorized,
                "Invalid credentials"
            )
        }

        authenticate("auth-student", "auth-admin", strategy = AuthenticationStrategy.FirstSuccessful) {
            get("/api/courses") {
//                println(call.principal<JWTPrincipal>()!!.getClaim("name", Int::class)!!)
                val roles = call.principal<JWTPrincipal>()!!.getListClaim("roles", String::class)
                if (roles.contains("student")) {
                    val userId = call.principal<JWTPrincipal>()!!.getClaim("sub", Int::class)!!
                    call.respond(courseRepository.getUserCourses(userId))
                } else {
                    call.respond(courseRepository.getAllCourses())
                }
            }
            get("/api/courses/{courseId}/reviews") {
                val roles = call.principal<JWTPrincipal>()!!.getListClaim("roles", String::class)
                if (roles.contains("student")) {
                    val courseId = call.parameters["courseId"]?.toIntOrNull()
                    val userId = call.principal<JWTPrincipal>()!!.getClaim("sub", Int::class)!!

                    if (courseId == null) {
                        call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                        return@get
                    }

                    val review: ReviewResponse? = reviewRepository.getUserReview(userId, courseId)
                    call.respond(mapOf("review" to review))
                } else {
                    val courseId = call.parameters["courseId"]?.toIntOrNull()

                    if (courseId == null) {
                        call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                        return@get
                    }

                    call.respond(reviewRepository.getReviewsByCourse(courseId))
                }
            }
        }

        authenticate("auth-student") {
            get("/api/students/{userId}/reviews") {
                val userId = call.parameters["userId"]?.toIntOrNull()
                if (userId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                    return@get
                }

                val reviews: List<ReviewResponse> = reviewRepository.getUserReviews(userId)
                call.respond(reviews)
            }

            post("/api/courses/{courseId}/reviews") {
                val courseId = call.parameters["courseId"]?.toIntOrNull()
                val userId = call.principal<JWTPrincipal>()!!.getClaim("sub", Int::class)!!

                if (courseId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                    return@post
                }

                val review = call.receive<ReviewAddRequest>()
                if (userId != review.userId) {
                    call.respond(HttpStatusCode.Forbidden, mapOf("message" to "You're not asking on your own behalf"))
                    return@post
                }
                try {
                    val createdReviewId = reviewRepository.addReview(review, courseId)
                    overallRepository.invalidateOverall(courseId)
                    call.respond(
                        HttpStatusCode.Created,
                        mapOf("id" to createdReviewId)
                    )
                    return@post
                } catch (e: DuplicateReviewException) {
                    call.respond(
                        HttpStatusCode.Conflict,
                        mapOf("message" to "User has already reviewed this course")
                    )
                    return@post
                } catch (e: Exception) {
                    println("ЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯЯ")
                    call.respond(
                        HttpStatusCode.NotFound,
                        mapOf("message" to "Course with id $courseId does not exist. Or any other problem while adding review")
                    )
                    throw e
                }
            }

            delete("/api/courses/{courseId}/reviews/{reviewId}") {
                val reviewId = call.parameters["reviewId"]?.toIntOrNull()
                val courseId = call.parameters["courseId"]?.toIntOrNull()
                val userId = call.principal<JWTPrincipal>()!!.getClaim("sub", Int::class)!!

                if (reviewId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid review ID format")
                    return@delete
                }
                if (courseId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                    return@delete
                }

                when (reviewRepository.getAuthor(reviewId)) {
                    null -> {
                        call.respond(
                            HttpStatusCode.NotFound,
                            mapOf("message" to "Review with id $reviewId does not exist.")
                        )
                        return@delete
                    }

                    userId -> Unit
                    else -> {
                        call.respond(
                            HttpStatusCode.Forbidden,
                            mapOf("message" to "You're not asking on your own behalf")
                        )
                        return@delete
                    }
                }

                try {
                    reviewRepository.deleteReview(reviewId)
                    overallRepository.invalidateOverall(courseId)
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        mapOf("message" to "Review with id $reviewId does not exist. Or any other problem while deleting review")
                    )
                    throw e
                }
                call.respond(HttpStatusCode.NoContent)
            }
        }

        authenticate("auth-admin") {
            get("/api/courses/{courseId}/reviews/summary") {
                val courseId = call.parameters["courseId"]?.toIntOrNull()

                if (courseId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Invalid course ID format")
                    return@get
                }

                val summary = overallRepository.getOverall(courseId)
                call.respond(
                    mapOf(
                        "summary" to summary
                    )
                )
            }
        }
    }
}

fun Route.generateToken(sub: Int, roles: Array<String>): String {
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    val secret = environment.config.property("jwt.secret").getString()

    val token = JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("sub", sub)
        .withArrayClaim("roles", roles)
        .withExpiresAt(Date(System.currentTimeMillis() + 3_600_000))
        .sign(Algorithm.HMAC256(secret))
    return token
}

fun Route.generateUserTokenMudaka(sub: Int, name: String, group: String, semester: Int): String {
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    val secret = environment.config.property("jwt.secret").getString()

    val token = JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("sub", sub)
        .withArrayClaim("roles", arrayOf("student"))
        .withClaim("id", sub)
        .withClaim("name", name)
        .withClaim("group", group)
        .withClaim("semester", semester)
        .withExpiresAt(Date(System.currentTimeMillis() + 3_600_000))
        .sign(Algorithm.HMAC256(secret))
    return token
}

fun Route.generateAdminTokenMudaka(sub: Int): String {
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    val secret = environment.config.property("jwt.secret").getString()

    val token = JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("sub", sub)
        .withArrayClaim("roles", arrayOf("admin"))
        .withClaim("id", sub)
        .withClaim("isAdmin", true)
        .withExpiresAt(Date(System.currentTimeMillis() + 3_600_000))
        .sign(Algorithm.HMAC256(secret))
    return token
}
