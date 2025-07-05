import { BASE_URL } from '../../App'
import type { UserJwtPayload } from '../../Entity/User'
import { useParams } from 'react-router-dom'
import { Box, Button, Fieldset, Heading, HStack, RadioGroup, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import type { Review } from '../../Entity/Review'
import { ReviewItem } from './ReviewItem'
import { useLocation } from 'react-router-dom'

const ratingItems = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
]

const formSchema = z.object({
  difficulty: z.number({ message: 'Difficulty rating is required' }).min(1).max(10),
  actuality: z.number({ message: 'Actuality rating is required' }).min(1).max(10),
  teacherQuality: z.number({ message: 'Teacher quality rating is required' }).min(1).max(10),
  overall: z
    .string({ message: 'Overall review is required' })
    .min(10, 'Используйте не менее 10 символов'),
})

type FormValues = z.infer<typeof formSchema>

export const ReviewForm = () => {


  const token = localStorage.getItem('token') || ''
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  
  if (!token) {
    console.error('Token not found in localStorage')
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl">Пожалуйста, войдите в систему, чтобы оставить отзыв</Text>
      </Box>
    )
  }

  const location = useLocation()
  const course = location.state?.course as { name: string; semester: string } | null

  const decodedToken = jwtDecode<UserJwtPayload>(token)
  const { courseId } = useParams()
  const parsedCourseId = Number(courseId)

  // Проверяем наличие отзыва в кэше
  useEffect(() => {
    const storageKey = `review_${parsedCourseId}_${decodedToken.id}`
    const storedReview = localStorage.getItem(storageKey)
    
    if (storedReview) {
      try {
        setUserReview(JSON.parse(storedReview))
      } catch (e) {
        console.error('Error parsing stored review', e)
      }
    }
    setLoading(false)
  }, [parsedCourseId, decodedToken.id])

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  })

  const handleDelete = (async (reviewId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/courses/${parsedCourseId}/reviews/${reviewId}`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error( "AAA +" + errorData.message)
      }

      const storageKey = `review_${parsedCourseId}_${decodedToken.id}`

      localStorage.removeItem(storageKey)
      setUserReview(null)

    } catch(error) {
      console.error('Error submitting review:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete review')
    }
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const reviewData = {
        userId: decodedToken.id,
        difficulty: data.difficulty,
        actuality: data.actuality,
        teacherQuality: data.teacherQuality,
        overall: data.overall,
      }

      const response = await fetch(`${BASE_URL}/courses/${parsedCourseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit review')
      }

      const result = await response.json()
      
      // Сохраняем отзыв в localStorage
      const storageKey = `review_${parsedCourseId}_${decodedToken.id}`
      const reviewToStore: Review = {
        id: result.id,
        difficulty: data.difficulty,
        actuality: data.actuality,
        teacherQuality: data.teacherQuality,
        overall: data.overall,
        courseId:parsedCourseId, 
        name: decodedToken.name, // Добавляем имя пользователя
        group: decodedToken.group || 'Не указана', // Добавляем группу
        createdDate: new Date().toISOString(), // Добавляем дату создания
      }
      
      localStorage.setItem(storageKey, JSON.stringify(reviewToStore))
      setUserReview(reviewToStore)
      
      alert('Thank you for your review!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit review')
    }
  })

  if (userReview) {
    return (
      <Box marginLeft={"50px"}>
         {course && (
        <Box mb={6}>
          <Heading as="h2" size="lg" mb={2}>
            {course.name}
          </Heading>
          <Text fontSize="md" color="gray.600">
            Семестр: {course.semester}
          </Text>
        </Box>
        )} 
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Ваш отзыв
          </Text>
        </Box>
        <Box display={"flex"} >
          <ReviewItem review={userReview} />
          <Button variant={"solid"} marginLeft={"30px"} font-size={"15px"} onClick={() => handleDelete(userReview.id)}>Удалить отзыв</Button>
        </Box>
      </Box>
    )
  }

  // Если идет загрузка - показываем индикатор
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Box>
      {course && (
        <Box mb={6} marginLeft={"20px"}>
          <Heading as="h2" size="lg" mb={2}>
            {course.name}
          </Heading>
          <Text fontSize="md" color="gray.600">
            Семестр: {course.semester}
          </Text>
        </Box>
      )}

      <form onSubmit={onSubmit}>
        <Fieldset.Root p={5}>
          <Fieldset.Legend>Оставьте ваш отзыв</Fieldset.Legend>

        {/* Difficulty Rating */}
        <Fieldset.Root invalid={!!errors.difficulty} mb={4}>
          <Fieldset.Legend>Сложность курса</Fieldset.Legend>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <RadioGroup.Root
                name={field.name}
                value={field.value?.toString() ?? ''}
                onValueChange={({ value }) => {
                  field.onChange(Number(value))
                }}
              >
                <HStack gap="4">
                  {ratingItems.map((item) => (
                    <RadioGroup.Item key={`difficulty-${item.value}`} value={item.value.toString()}>
                      <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </HStack>
              </RadioGroup.Root>
            )}
          />
          {errors.difficulty && (
            <Fieldset.ErrorText>{errors.difficulty.message}</Fieldset.ErrorText>
          )}
        </Fieldset.Root>

        {/* Actuality Rating */}
        <Fieldset.Root invalid={!!errors.actuality} mb={4}>
          <Fieldset.Legend>Актуальность курса</Fieldset.Legend>
          <Controller
            name="actuality"
            control={control}
            render={({ field }) => (
              <RadioGroup.Root
                name={field.name}
                value={field.value?.toString() ?? ''}
                onValueChange={({ value }) => {
                  field.onChange(Number(value))
                }}
              >
                <HStack gap="4">
                  {ratingItems.map((item) => (
                    <RadioGroup.Item key={`actuality-${item.value}`} value={item.value.toString()}>
                      <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </HStack>
              </RadioGroup.Root>
            )}
          />
          {errors.actuality && <Fieldset.ErrorText>{errors.actuality.message}</Fieldset.ErrorText>}
        </Fieldset.Root>

        <Fieldset.Root invalid={!!errors.teacherQuality} mb={4}>
          <Fieldset.Legend>Качество преподавания</Fieldset.Legend>
          <Controller
            name="teacherQuality"
            control={control}
            render={({ field }) => (
              <RadioGroup.Root
                name={field.name}
                value={field.value?.toString() ?? ''}
                onValueChange={({ value }) => {
                  field.onChange(Number(value))
                }}
              >
                <HStack gap="4">
                  {ratingItems.map((item) => (
                    <RadioGroup.Item
                      key={`teacherQuality-${item.value}`}
                      value={item.value.toString()}
                    >
                      <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </HStack>
              </RadioGroup.Root>
            )}
          />
          {errors.teacherQuality && (
            <Fieldset.ErrorText>{errors.teacherQuality.message}</Fieldset.ErrorText>
          )}
        </Fieldset.Root>
        {/* Overall Review */}
        <Fieldset.Root invalid={!!errors.overall} mb={4}>
          <Fieldset.Legend>Общие впечатления/предложения по курсу</Fieldset.Legend>
          <Controller
            name="overall"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  border: errors.overall ? '1px solid red' : '1px solid #ccc',
                  borderRadius: '4px',
                }}
                placeholder="Пожалуйста, напишите ваш отзыв здесь..."
              />
            )}
          />
          {errors.overall && <Fieldset.ErrorText>{errors.overall.message}</Fieldset.ErrorText>}
        </Fieldset.Root>

        <Button size="sm" type="submit" alignSelf="flex-start" disabled={!isValid}>
          Отправить отзыв
        </Button>
      </Fieldset.Root>
      </form>
    </Box>
  )
}
