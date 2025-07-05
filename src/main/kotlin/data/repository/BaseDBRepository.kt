package com.paitor.practice.data.repository

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase
import org.jetbrains.exposed.v1.r2dbc.R2dbcTransaction
import org.jetbrains.exposed.v1.r2dbc.transactions.suspendTransaction

abstract class BaseDBRepository(protected open val db: R2dbcDatabase) {
    protected open suspend fun <T> dbQuery(block: suspend R2dbcTransaction.() -> T): T =
        suspendTransaction(Dispatchers.IO, db = db) {
            block()
        }
}