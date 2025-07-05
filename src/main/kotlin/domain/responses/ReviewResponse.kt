package com.paitor.practice.domain.responses

import kotlinx.serialization.Serializable

@Serializable
data class ReviewResponse(
    val id : Int,
    val courseId : Int,
    val name : String, // ФИО
    val group : String, // Название группы
    val createdDate : String,
    val actuality : Int,
    val difficulty : Int,
    val teacherQuality : Int,
    val overall: String,
)