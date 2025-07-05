import { useQuery } from '@tanstack/react-query'
import type { Review } from '../Entity/Review'
import { BASE_URL } from '../App'

import { mockReviews } from '../mock/Review'

const REVIEWS_CACHE_KEY = 'reviewsCache'
const CACHE_DURATION = 5*60*1000 // 5 минут

const getCachedReviews = (userId: number): Review[] | null => {

  try {
    const cached = localStorage.getItem(`${REVIEWS_CACHE_KEY}_${userId}`)

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
    localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${userId}`)
    return null
  } catch (error) {
    console.error('Ошибка при чтении кэша отзывов:', error)
    localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${userId}`)
    return null
  }
}

const setCachedReviews = (userId: number, data: Review[]) => {
  try {
    localStorage.setItem(
      `${REVIEWS_CACHE_KEY}_${userId}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    )
  } catch (error) {
    console.error('Ошибка при сохранении отзывов в кэш:', error)
  }
}

const fetchReviews = async (userId: number, name:string): Promise<Review[]> => {

  const dev = false; // изменить на false при тестировании

  const token = localStorage.getItem('token')
  
  // if (!token) {
  //   throw new Error('Токен авторизации не найден')
  // }
  if (dev) {
    console.log("моки rev", mockReviews)

    const mockData = mockReviews.filter(review => {
      console.log("имя из ревью : ", review.name);
      console.log("\n")
      console.log("имя из пропса : ", name);

      return review.name === name
    })
    setCachedReviews(userId, mockData)
    console.log("моки rev после fil", mockData)
    return mockData
  }

  localStorage.removeItem(`${REVIEWS_CACHE_KEY}_${userId}`)
  
  // Проверяем кэш
  const cachedData = getCachedReviews(userId)
  if (cachedData) {
    return cachedData
  }

  // Запрос к серверу
  const response = await fetch(`${BASE_URL}/students/${userId}/reviews`, {
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
  setCachedReviews(userId, reviewsData)

  return reviewsData
}

export const useUsersReviews = (userId: number, name: string) => {
    console.log("usrev,", userId, name)
  const { 
    data: reviews = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Review[]>({
    queryKey: ['reviews', userId],
    queryFn: () => fetchReviews(userId, name),
    enabled: !!userId, // Запрос выполняется только если userId существует
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

  console.log(reviews)

  return {
    reviews,
    isLoading,
    error,
    refetch,
  }
}