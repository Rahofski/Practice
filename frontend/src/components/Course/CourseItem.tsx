import { Button, Card, Image, Text } from '@chakra-ui/react'
import { jwtDecode } from 'jwt-decode' // Импортируем jwtDecode
import type { UserJwtPayload } from '../../Entity/User'

type Course = {
  id: number
  name: string
  description: string
  semester: number // Semester in which the course is offered
  teacher: string // Name of the teacher
  imageUrl: string // Optional image URL for the course
}

type CourseItemProps = {
  course: Course
  handleAdminReviewPage: (id: number) => void
  handleLeaveReview: (id: number) => void
}

export const CourseItem = ({
  course,
  handleAdminReviewPage,
  handleLeaveReview,
}: CourseItemProps) => {

  const token = localStorage.getItem('token')
  const decodedToken = token ? jwtDecode<UserJwtPayload>(token) : ({} as UserJwtPayload)

  return (
    <Card.Root maxW="sm" overflow="hidden">
      <Image src={course.imageUrl} alt={course.name} />
      <Card.Body gap="2">
        <Card.Title textStyle="2xl">{course.name}</Card.Title>
        <Card.Description>{course.description}</Card.Description>
        <Text textStyle="xl" fontWeight="medium" letterSpacing="tight" mt="2">
          Семестр: {course.semester}
        </Text>
      </Card.Body>
      <Card.Footer gap="2">
        {!decodedToken.isAdmin && (
          <Button variant="solid" onClick={() => handleLeaveReview(course.id)}>
            Оставить отзыв
          </Button>
        )}
        {decodedToken.isAdmin && (
          <Button variant="solid" onClick={() => handleAdminReviewPage(course.id)}>
            Посмотреть отзывы
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  )
}
