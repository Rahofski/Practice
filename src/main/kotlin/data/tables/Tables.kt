package com.paitor.practice.data.tables

import org.jetbrains.exposed.v1.core.dao.id.IntIdTable

object UserTable : IntIdTable("user") {
    val name = text("name")
    val email = text("email").uniqueIndex()
    val password = text("password")
    val groupId = reference("group_id", GroupTable)
}

object AdminTable : IntIdTable("admin") {
    val email = text("email").uniqueIndex()
    val password = text("password")
}

object GroupTable : IntIdTable("group") {
    val name = text("name").uniqueIndex()
    val semester = integer("semester")
}

object CourseTable : IntIdTable("course") {
    val name = text("name")
    val description = text("description")
    val semester = integer("semester")
    val teacher = text("teacher")
    val imageUrl = text("image_url")
}

object ReviewTable : IntIdTable("review") {
    val courseId = reference("course_id", CourseTable)
    val userId = reference("user_id", UserTable)
    val creationDate = text("creation_date")
    val actuality = integer("actuality")
    val difficulty = integer("difficulty")
    val teacherQuality = integer("teacher_quality")
    val overall = text("overall")
}

object OverallTable: IntIdTable("overall") {
    val courseId = reference("course_id", CourseTable)
    val text = text("text")
}