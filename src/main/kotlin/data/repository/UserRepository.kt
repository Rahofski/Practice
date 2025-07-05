package com.paitor.practice.data.repository

import com.paitor.practice.data.tables.GroupTable
import com.paitor.practice.data.tables.UserTable
import com.paitor.practice.domain.model.User
import kotlinx.coroutines.flow.firstOrNull
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.select

class UserRepository(db: R2dbcDatabase) : BaseDBRepository(db) {

    suspend fun logIn(email: String, password: String): User? = dbQuery {
        val user = (UserTable innerJoin GroupTable).select(UserTable.id, UserTable.name, GroupTable.name, GroupTable.semester)
            .where { (UserTable.email eq email) and (UserTable.password eq password) }
            .limit(1)
            .firstOrNull()?.let {
                User(
                    id = it[UserTable.id].value,
                    name = it[UserTable.name],
                    groupName = it[GroupTable.name],
                    semester = it[GroupTable.semester]
                )
            }
        return@dbQuery user
    }
}