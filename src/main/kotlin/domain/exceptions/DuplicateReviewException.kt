package com.paitor.practice.domain.exceptions

class DuplicateReviewException(message: String = "User has already reviewed this course") : RuntimeException(message)