package com.paitor.practice.data.repository

import com.paitor.practice.data.tables.OverallTable
import com.paitor.practice.data.tables.ReviewTable
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.jetbrains.exposed.v1.core.SqlExpressionBuilder.eq
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.deleteWhere
import org.jetbrains.exposed.v1.r2dbc.insert
import org.jetbrains.exposed.v1.r2dbc.select
import org.jetbrains.exposed.v1.r2dbc.selectAll

class OverallRepository(db: R2dbcDatabase, private val overallGetter: OverallGetter) : BaseDBRepository(db) {
    suspend fun invalidateOverall(courseId: Int) = dbQuery {
        OverallTable.deleteWhere { OverallTable.courseId eq courseId }
    }

    suspend fun getOverall(courseId: Int): String {
        val overall = dbQuery {
            OverallTable.selectAll()
                .where { OverallTable.courseId eq courseId }
                .limit(1)
                .firstOrNull()
                ?.let { it[OverallTable.text] }
        } ?: dbQuery {
            ReviewTable
                .select(ReviewTable.courseId, ReviewTable.overall)
                .where { ReviewTable.courseId eq courseId }
                .map { it[ReviewTable.overall] }
                .toList()
        }.let { calcOverall(courseId, it) }
        return overall
    }

    private suspend fun calcOverall(courseId: Int, review: List<String>): String {
        val overall = overallGetter.get(review)
        dbQuery {
            OverallTable.insert {
                it[this.courseId] = courseId
                it[this.text] = overall
            }
        }
        return overall
    }
}