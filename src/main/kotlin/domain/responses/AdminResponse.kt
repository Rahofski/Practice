package com.paitor.practice.domain.responses

import kotlinx.serialization.Serializable

@Serializable
data class AdminResponse(
    val token: String
)
