package com.paitor.practice

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*


fun Application.configureSecurity() {
    val secret = environment.config.propertyOrNull("jwt.secret")?.getString() ?: error("Реально нулл")
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    authentication {
        jwt("auth-student") {
            realm = "Student access to '/api'"
            verifier(
                JWT
                    .require(Algorithm.HMAC256(secret))
                    .withIssuer(issuer)
                    .withAudience(audience)
                    .withArrayClaim("roles", "student")
                    // TODO add expiresAt
                    .build()
            )
            validate { credential ->
                if (credential.payload
                        .getClaim("roles")
                        .asList(String::class.java)
                        .run { contains("student") }
                ) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
//            challenge { defaultScheme, realm ->
//                println("юзер отвергнут")
////                call.respond(HttpStatusCode.Unauthorized, "Token is not valid or has expired")
//            }
        }
        jwt("auth-admin") {
            realm = "Admin access to '/api'"
            verifier(
                JWT
                    .require(Algorithm.HMAC256(secret))
                    .withIssuer(issuer)
                    .withArrayClaim("roles", "admin")
                    .withAudience(audience)
                    .build()
            )
            validate { credential ->
                if (credential.payload
                        .getClaim("roles")
                        .asList(String::class.java)
                        .contains("admin")
                ) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
//            challenge { defaultScheme, realm ->
//                println("Админ отвергнут")
////                call.respond(HttpStatusCode.Unauthorized, "Token is not valid or has expired")
//            }
        }
    }
}
