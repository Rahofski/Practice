import { useQuery } from '@tanstack/react-query'
import type { Course } from '../Entity/Course'
import { Courses as mockCourses } from '../mock/Course'
import { BASE_URL } from '../App'

const CACHE_KEY = 'coursesCache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 часа

//исправить на false при тестировании
const dev = false;

const getCachedData = (): Course[] | null => {
  try {

    const cached = localStorage.getItem(CACHE_KEY)
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
    
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.error('Ошибка при чтении кэша:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

const setCachedData = (data: Course[]) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    )
  } catch (error) {
    console.error('Ошибка при сохранении в кэш:', error)
  }
}

const fetchCourses = async (): Promise<Course[]> => {
  const token = localStorage.getItem('token')


  //расскоментить при тестировании!!!!

  if (!token) {
    throw new Error('Токен авторизации не найден')
  }

  if (dev) {
    const mockData = mockCourses
    setCachedData(mockData)
    return mockData
  }

  if (!dev) {
    localStorage.removeItem(CACHE_KEY)
  }

  // Проверяем кэш
  const cachedData = getCachedData()
  if (cachedData) {
    return cachedData
  }

  // TODO: Удалить при переходе в продакшн

  const response = await fetch(`${BASE_URL}/courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Ошибка загрузки курсов: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  const coursesData = Array.isArray(data) ? data : []

  setCachedData(coursesData)

  console.log(coursesData)

  return coursesData // coursesData.filter(course => course.semester <= decodedToken.semester)
}

export const useCourses = () => {
  const { data: courses = [], isLoading, error, refetch } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 30 * 60 * 1000, // 30 минут (бывший cacheTime)
    retry: (failureCount, error) => {
      // Не повторяем запрос при ошибке авторизации
      if (error.message.includes('Токен авторизации не найден')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    courses,
    isLoading,
    error,
    refetch,
  }
}