package com.paitor.practice.domain.requests

import kotlinx.serialization.Serializable

@Serializable
data class ReviewAddRequest(
    val userId : Int,
    val actuality : Int,
    val difficulty : Int,
    val teacherQuality : Int,
    val overall: String,
)
