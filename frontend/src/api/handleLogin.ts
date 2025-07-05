// handleLogin.ts
import { BASE_URL } from '../App'

export const handleLogin = async (
  email: string, 
  password: string, 
  setToken: (token: string) => void
) => {
  console.log("handleLogin called")
  try {
    const response = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const status = response.status
    console.log("HTTP Status Code:", status)

    let data = null
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    }

    if (!response.ok) {
      const errorMessage = data?.error || `Ошибка ${status}`
      throw new Error(errorMessage)
    }

    const token = data?.token
    if (!token) {
      throw new Error('No token received')
    }

    localStorage.setItem('token', token)
    setToken(token)

  } catch (error) {
    console.log('Ошибка при логине:', error)
    throw new Error('Ошибка авторизации')
  }
}
