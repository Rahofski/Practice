package com.paitor.practice.data.repository

import com.paitor.practice.data.tables.AdminTable
import com.paitor.practice.domain.model.Admin
import kotlinx.coroutines.flow.firstOrNull
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.select

class AdminRepository( db: R2dbcDatabase): BaseDBRepository(db) {
    suspend fun logIn(email: String, password: String): Admin? = dbQuery {
        val admin = (AdminTable).select(AdminTable.id)
            .where { (AdminTable.email eq email) and (AdminTable.password eq password) }
            .limit(1)
            .firstOrNull()
            ?.let { Admin(it[AdminTable.id].value) }
        return@dbQuery admin
    }
}