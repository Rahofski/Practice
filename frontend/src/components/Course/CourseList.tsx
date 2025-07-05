import { CourseItem } from './CourseItem'
import { Grid, Text, Button, Spinner, Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../../api/handleGetCourseList'
import type { Course } from '../../Entity/Course'

export const CourseList = () => {
  const navigate = useNavigate()
  const { courses, isLoading, error, refetch } = useCourses()

  const handleLeaveReview = (course: Course) => { 
  setTimeout(() => {
    navigate(`/reviewForm/${course.id}`, { state: { course } }) 
  }, 1000)
}

  const handleAdminReviewPage = (id: number) => {
    setTimeout(() => {
      navigate(`/adminReviewPage/${id}`)
    }, 1000)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Spinner size="xl" />
        <Text ml={4}>Загрузка курсов...</Text>
      </Box>
    )
  }

  // Состояние ошибки
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"> 
        <Box flex="1">
          <Text fontWeight="bold">Ошибка загрузки курсов</Text>
          <Text fontSize="sm">{error.message}</Text>
        </Box>
        <Button size="sm" marginTop="20px" onClick={() => refetch()} ml={4}>
          Повторить
        </Button>
      </Box>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Курсы не найдены
        </Text>
        <Button mt={4} onClick={() => refetch()}>
          Обновить
        </Button>
      </Box>
    )
  }

  // Отображение курсов
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={6} padding={4}>
      {courses.map((course) => (
        <CourseItem
          key={course.id}
          course={course}
          handleAdminReviewPage={handleAdminReviewPage}
          handleLeaveReview={() => handleLeaveReview(course)}
        />
      ))}
    </Grid>
  )
}

