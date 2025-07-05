import { useQuery } from '@tanstack/react-query'
import type { Review } from '../Entity/Review'
import { BASE_URL } from '../App'

import { mockReviews } from '../mock/Review'

const REVIEWS_CACHE_KEY = 'reviewsCache'

const CACHE_DURATION = 5*60*1000 // 5 минут

const getCachedReviews = (courseId: number): Review[] | null => {

  try {
    const cached = localStorage.getItem(`${REVIEWS_CACHE_KEY}_${courseId}`)

    if (!cached) return null

    const parsed = JSON.parse(cached)
    
    if (
      parsed?.data &&
      Array.isArray(parsed.data) &&
      parsed.timestamp &&
      Date.now() - parsed.timestamp < CACHE_DURATION
    ) {
      return parsed.data
    }
    
    // Удаляем устаревший кэш
    localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${courseId}`)
    return null
  } catch (error) {
    console.error('Ошибка при чтении кэша отзывов:', error)
    localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${courseId}`)
    return null
  }
}

const setCachedReviews = (courseId: number, data: Review[]) => {
  try {
    localStorage.setItem(
      `${REVIEWS_CACHE_KEY}_${courseId}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    )
  } catch (error) {
    console.error('Ошибка при сохранении отзывов в кэш:', error)
  }
}

const fetchReviews = async (courseId: number): Promise<Review[]> => {

  const dev = false; // изменить на false при тестировании 

  const token = localStorage.getItem('token')
  
  // if (!token) {
  //   throw new Error('Токен авторизации не найден')
  // }

  if (dev) {
    const mockData = mockReviews.filter(review => review.courseId === courseId)
    setCachedReviews(courseId, mockData)
    return mockData
  }

  localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${courseId}`)
  
  // Проверяем кэш
  const cachedData = getCachedReviews(courseId)
  if (cachedData) {
    return cachedData
  }

  // Запрос к серверу
  const response = await fetch(`${BASE_URL}/courses/${courseId}/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Ошибка загрузки отзывов: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const reviewsData = Array.isArray(data) ? data : []

  // Сохраняем в кэш
  setCachedReviews(courseId, reviewsData)

  return reviewsData
}

export const useReviews = (courseId: number) => {
  const { 
    data: reviews = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Review[]>({
    queryKey: ['reviews', courseId],
    queryFn: () => fetchReviews(courseId),
    enabled: !!courseId, // Запрос выполняется только если courseId существует
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    retry: (failureCount, error) => {
      if (error.message.includes('Токен авторизации не найден')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Фильтрация отзывов по courseId (на случай, если сервер вернет лишние данные)
  const filteredReviews = reviews.filter(review => review.courseId === courseId)

  return {
    reviews: filteredReviews,
    isLoading,
    error,
    refetch,
  }
}