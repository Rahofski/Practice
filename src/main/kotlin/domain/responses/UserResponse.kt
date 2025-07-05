package com.paitor.practice.domain.responses

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val token: String,
    var name: String,
    var groupName: String,
    var semester: Int,
)
