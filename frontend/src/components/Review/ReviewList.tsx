// components/ReviewList.tsx
import { ReviewItem } from './ReviewItem'
import { Stack, Box, Text, Heading, Spinner, Button } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Tag } from '@chakra-ui/tag'
import { useReviews } from '../../api/handleGetReviews'
import { useUsersReviews } from '../../api/handleGetUsersReviews'

interface ReviewListProps {
  id: number
  name:string
  isAdmin: boolean
}

export const ReviewList = ({ id, name, isAdmin }: ReviewListProps) => {
  console.log("имя из листа", name)
  const emptyStateColor = useColorModeValue('gray.400', 'gray.600')
  const { reviews, isLoading, error, refetch } = isAdmin
    ? useReviews(id)
    : useUsersReviews(id, name)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={10}>
        <Spinner size="xl" />
        <Text ml={4} fontSize="xl">Загрузка отзывов...</Text>
      </Box>
    )
  }

  // Состояние ошибки
  if (error) {
    return (
      <Box p={5}>
        <>
          <Box flex="1">
            <Text fontWeight="bold">Ошибка загрузки отзывов</Text>
            <Text fontSize="sm">{error.message}</Text>
          </Box>
          <Button size="sm" onClick={() => refetch()} ml={4}>
            Повторить
          </Button>
        </>
      </Box>
    )
  }

  return (
    <Box p={5}>
      <Heading as="h2" size="lg" mb={6}>
        Отзывов:
        <Tag ml={3} size="lg" colorScheme="teal" borderRadius="full">
          {reviews.length}
        </Tag>
      </Heading>

      {reviews.length > 0 ? (
        <Stack gap={6}>
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </Stack>
      ) : (
        <Box
          textAlign="center"
          py={10}
          border="1px dashed"
          borderColor={emptyStateColor}
          borderRadius="lg"
        >
          <Text fontSize="lg" color={emptyStateColor}>
            Пока нет отзывов.
          </Text>
          <Button mt={4} variant="outline" onClick={() => refetch()}>
            Обновить
          </Button>
        </Box>
      )}
    </Box>
  )
}