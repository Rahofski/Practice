package com.paitor.practice.data.repository

import com.paitor.practice.data.tables.GroupTable
import com.paitor.practice.data.tables.ReviewTable
import com.paitor.practice.data.tables.UserTable
import com.paitor.practice.domain.exceptions.DuplicateReviewException
import com.paitor.practice.domain.requests.ReviewAddRequest
import com.paitor.practice.domain.responses.ReviewResponse
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.jetbrains.exposed.v1.core.SqlExpressionBuilder.eq
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.r2dbc.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class ReviewRepository(db: R2dbcDatabase) : BaseDBRepository(db) {
    suspend fun getUserReview(userId: Int, courseId: Int): ReviewResponse? = dbQuery {
        (ReviewTable innerJoin UserTable innerJoin GroupTable).selectAll()
            .where { (ReviewTable.userId eq userId) and (ReviewTable.courseId eq courseId) }
            .firstOrNull()
            ?.let {
                ReviewResponse(
                    id = it[ReviewTable.id].value,
                    courseId = courseId,
                    name = it[UserTable.name],
                    group = it[GroupTable.name],
                    createdDate = it[ReviewTable.creationDate],
                    actuality = it[ReviewTable.actuality],
                    difficulty = it[ReviewTable.difficulty],
                    teacherQuality = it[ReviewTable.teacherQuality],
                    overall = it[ReviewTable.overall],
                )
            }
    }

    suspend fun getUserReviews(userId: Int): List<ReviewResponse> = dbQuery {
        (ReviewTable innerJoin UserTable innerJoin GroupTable).selectAll()
            .where { ReviewTable.userId eq userId }
            .map {
                ReviewResponse(
                    id = it[ReviewTable.id].value,
                    courseId = it[ReviewTable.courseId].value,
                    name = it[UserTable.name],
                    group = it[GroupTable.name],
                    createdDate = it[ReviewTable.creationDate],
                    actuality = it[ReviewTable.actuality],
                    difficulty = it[ReviewTable.difficulty],
                    teacherQuality = it[ReviewTable.teacherQuality],
                    overall = it[ReviewTable.overall],
                )
            }
            .toList()
    }

    suspend fun getReviewsByCourse(courseId: Int): List<ReviewResponse> = dbQuery {
        (ReviewTable innerJoin UserTable innerJoin GroupTable).selectAll()
            .where((ReviewTable.courseId eq courseId))
            .map {
                ReviewResponse(
                    id = it[ReviewTable.id].value,
                    courseId = courseId,
                    name = it[UserTable.name],
                    group = it[GroupTable.name],
                    createdDate = it[ReviewTable.creationDate],
                    actuality = it[ReviewTable.actuality],
                    difficulty = it[ReviewTable.difficulty],
                    teacherQuality = it[ReviewTable.teacherQuality],
                    overall = it[ReviewTable.overall],
                )
            }
            .toList()
    }

    suspend fun addReview(review: ReviewAddRequest, courseId: Int) =
        dbQuery {
            try {
                return@dbQuery ReviewTable.insertAndGetId {
                    it[this.courseId] = courseId
                    it[userId] = review.userId
                    it[creationDate] = getCurrentDate()
                    it[actuality] = review.actuality
                    it[difficulty] = review.difficulty
                    it[teacherQuality] = review.teacherQuality
                    it[overall] = review.overall
                }.value
            } catch (e: ExposedR2dbcException) {
                throw DuplicateReviewException()
            }
        }

    suspend fun deleteReview(reviewId: Int) = dbQuery {
        ReviewTable.deleteWhere { ReviewTable.id eq reviewId }
    }

    suspend fun getAuthor(reviewId: Int): Int? = dbQuery {
        return@dbQuery ReviewTable.select(ReviewTable.id, ReviewTable.userId)
            .where { ReviewTable.id eq reviewId }
            .limit(1)
            .firstOrNull()
            ?.let { it[ReviewTable.userId].value }
    }
}

private fun getCurrentDate(): String {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    return LocalDate.now().format(formatter)
}

