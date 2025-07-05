import { useMutation } from '@tanstack/react-query'
import { BASE_URL } from '../App'

const generateSummary = async (courseId: number): Promise<string> => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('Токен авторизации не найден')
  }

  const response = await fetch(`${BASE_URL}/courses/${courseId}/reviews/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Ошибка генерации сводки: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.summary
}

export const useSummary = () => {
  const mutation = useMutation({
    mutationFn: generateSummary,
    onSuccess: (data) => {
      console.log('Сводка успешно сгенерирована:', data)
    },
    onError: (error) => {
      console.error('Ошибка при генерации сводки:', error)
    },
  })

  return {
    generateSummary: mutation.mutate,
    summary: mutation.data,
    isGenerating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}