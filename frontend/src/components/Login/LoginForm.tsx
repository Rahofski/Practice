import { Button, Card, Center, Box, Image, Stack, Field, Input, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleLogin } from '../../api/handleLogin'
import { useAuth } from '../contexts/AuthContext'

export const LoginForm = () => {
  
  const dev = false; // изменить на false


  const redirectPath = '/courseList' 
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, isError] = useState(false)
  const navigate = useNavigate() 
  const handleClear = () => {
    setEmail('')
    setPassword('')
    isError(false)
  }

  const handleViktor = async () => {

    try { 
    const storedToken = localStorage.getItem('token')
      const response = await fetch('http://25.34.90.227:8080/gg', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
                Authorization: `Bearer ${storedToken}`,
            },

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
      
          const newToken = data?.token
          if (!newToken) {
            throw new Error('No token received')
          }
      
          localStorage.setItem('token', newToken)
          setToken(newToken)
      
        } catch (error) {
          console.log('Ошибка при логине:', error)
          throw new Error('Ошибка авторизации')
        }
  }

  const handleLog = async () => {
    try {
      if (!dev) {
        await handleLogin(email, password, setToken) // Передаем setToken
        setEmail('')
        setPassword('')
        setTimeout(() => {
          navigate(redirectPath)
        }, 1000)
      }
      else {

      }
    } catch (error) {
      isError(true)
    }
  }

  return (
    <Center height="70vh" width="100vw">
      <Card.Root
        display="flex"
        flexDirection="row"
        overflow="hidden"
        maxW="1000px"
        width="100%"
        height="500px" // Фиксированная высота карточки
      >
        <Box
          flex="1"
          position="relative"
          minW="250px" // Минимальная ширина изображения
        >
          <Image
            src="https://fort-russia.com/upload/medialibrary/19f/19fdd86b44ff802375b85895f165f0ea.jpg"
            objectFit="cover"
            width="100%"
            height="100%"
            position="absolute"
            top="0"
            left="0"
          />
        </Box>

        <Box
          flex="1"
          minW="300px" // Минимальная ширина формы
          p={6}
        >
          <Card.Header>
            <Card.Title fontSize={'30px'}>Авторизация</Card.Title>
            <Card.Description fontSize={'20px'}>
              Заполните форму для входа в систему
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Field.Root>
                <Field.Label fontSize={'18px'}>Почта</Field.Label>
                <Input
                  type="email"
                  placeholder="Введите почту"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field.Root>
              <Field.Root marginTop={'20px'}>
                <Field.Label fontSize={'18px'}>Пароль</Field.Label>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field.Root>
            </Stack>
          </Card.Body>
          <Card.Footer marginTop={'40px'} display="block">
            <Box display="flex" justifyContent="space-between" gap="4" minWidth={'425px'}>
              <Button variant="outline" onClick={handleClear} fontSize={'20px'}>
                Сбросить
              </Button>
              <Button variant="solid" onClick={handleLog} fontSize={'20px'}>
                Войти
              </Button>
            </Box>
            <Box marginTop="20px" minWidth={'425px'} display="flex" justifyContent="center">
              {error && (
                <Text color={'red'} fontSize={'15px'} fontWeight="500">
                  Ошибка при авторизации
                </Text>
              )}
            </Box>
          </Card.Footer>
        </Box>
      </Card.Root>
    </Center>
  )
}
