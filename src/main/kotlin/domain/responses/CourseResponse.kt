package com.paitor.practice.domain.responses

import kotlinx.serialization.Serializable

@Serializable
data class CourseResponse(
    val id: Int,
    val name: String,
    val description: String,
    val semester: Int,
    val teacher: String,
    val imageUrl: String,
)
