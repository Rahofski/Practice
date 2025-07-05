package com.paitor.practice.data.repository

import com.paitor.practice.data.tables.CourseTable
import com.paitor.practice.data.tables.GroupTable
import com.paitor.practice.data.tables.UserTable
import com.paitor.practice.domain.responses.CourseResponse
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import org.jetbrains.exposed.v1.core.JoinType
import org.jetbrains.exposed.v1.core.SqlExpressionBuilder.eq
import org.jetbrains.exposed.v1.core.SqlExpressionBuilder.lessEq
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.select
import org.jetbrains.exposed.v1.r2dbc.selectAll

class CourseRepository(db: R2dbcDatabase) : BaseDBRepository(db) {
    suspend fun getAllCourses() = dbQuery {
        return@dbQuery CourseTable.selectAll()
            .map {
                CourseResponse(
                    id = it[CourseTable.id].value,
                    name = it[CourseTable.name],
                    description = it[CourseTable.description],
                    semester = it[CourseTable.semester],
                    teacher = it[CourseTable.teacher],
                    imageUrl = it[CourseTable.imageUrl]
                )
            }
            .toList()
    }

    suspend fun getUserCourses(userId: Int): List<CourseResponse> = dbQuery {
        return@dbQuery (UserTable innerJoin GroupTable).join(
            CourseTable,
            JoinType.INNER,
            additionalConstraint = { CourseTable.semester lessEq GroupTable.semester }
        )
            .selectAll()
            .where { (UserTable.id eq userId) and (CourseTable.semester lessEq GroupTable.semester) }
            .map {
                CourseResponse(
                    id = it[CourseTable.id].value,
                    name = it[CourseTable.name],
                    description = it[CourseTable.description],
                    semester = it[CourseTable.semester],
                    teacher = it[CourseTable.teacher],
                    imageUrl = it[CourseTable.imageUrl]
                )
            }
            .toList()
    }
}