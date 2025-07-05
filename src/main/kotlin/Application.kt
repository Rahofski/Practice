package com.paitor.practice

import com.paitor.practice.data.repository.*
import io.ktor.client.*
import io.ktor.client.engine.java.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.r2dbc.postgresql.PostgresqlConnectionConfiguration
import io.r2dbc.postgresql.PostgresqlConnectionFactory
import io.r2dbc.spi.ConnectionFactoryOptions.DRIVER
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabaseConfig
import java.security.KeyStore
import java.security.cert.CertificateFactory
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManagerFactory


fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    val database = getDatabase()
    val overallGetter = getOverallGetter()

    mainConfigure(database, overallGetter)
}

private fun Application.getOverallGetter(): OverallGetterImpl {
    val client = HttpClient(Java) {
        install(ContentNegotiation) {
            json()
        }
        engine {
            config {
                sslContext(createCustomSslContext())
            }
        }
    }
    val overallGetter = OverallGetterImpl(
        client,
        environment.config.property("gigachat.secret_key").getString()
    )
    return overallGetter
}

private fun Application.getDatabase(): R2dbcDatabase {
    val factory = PostgresqlConnectionFactory(
        PostgresqlConnectionConfiguration.builder()
            .host(environment.config.property("db.host").getString())
            .port(5432)
            .database(environment.config.property("db.database").getString())
            .username(environment.config.property("db.username").getString())
            .password(environment.config.property("db.password").getString())
            .build()
    )
    val database = R2dbcDatabase.connect(
        connectionFactory = factory,
        databaseConfig = R2dbcDatabaseConfig.Builder().apply {
            connectionFactoryOptions {
                option(DRIVER, "postgresql")
            }
        }.build()
    )
    return database
}


fun Application.mainConfigure(database: R2dbcDatabase, overallGetter: OverallGetter) {
    configureCORS()
    configureMonitoring()
    configureSecurity()
    configureRouting(
        UserRepository(database),
        AdminRepository(database),
        CourseRepository(database),
        ReviewRepository(database),
        OverallRepository(database, overallGetter),
    )
}


fun createCustomSslContext(): SSLContext {
    val keyStore = KeyStore.getInstance(KeyStore.getDefaultType()).apply {
        load(null, null)

        listOf(
            "/certificates/russian_trusted_root_ca.cer",
            "/certificates/russian_trusted_sub_ca/russian_trusted_sub_ca.cer",
            "/certificates/russian_trusted_sub_ca/russian_trusted_sub_ca_2024.cer",
            "/certificates/russian_trusted_sub_ca/russian_trusted_sub_ca_gost_2025.cer",
        ).forEachIndexed { index, certPath ->
            object {}.javaClass.getResourceAsStream(certPath).use { stream -> // TODO: -object{}
                setCertificateEntry(
                    "custom-cert-$index",
                    CertificateFactory.getInstance("X.509").generateCertificate(stream)
                )
            }
        }
    }

    val trustManagerFactory = TrustManagerFactory
        .getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
            init(keyStore)
        }

    return SSLContext.getInstance("TLS").apply {
        init(null, trustManagerFactory.trustManagers, null)
    }
}
