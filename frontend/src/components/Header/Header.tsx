import { Flex, Box, Heading, Image, Text } from '@chakra-ui/react'
import logo from '../../images/logo_vert.svg'
import { jwtDecode } from 'jwt-decode'
import type { UserJwtPayload } from '../../Entity/User'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export const Header = () => {

  const { token } = useAuth()
  
  const decodedToken = token ? jwtDecode<UserJwtPayload>(token) : null

  const userId = decodedToken?.id;

  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/UserAccount/${userId}`)
  }


  const location = useLocation()
  
  const isLoginPage = location.pathname === '/'

  return (
    <Flex align="center" justify="space-between" mb={4} pl={4} pr={4}>
      <Flex align="center">
        <Image src={logo} alt="Логотип СПбПУ" boxSize="100px" mr={4} />
        <Box width="2px" height="80px" backgroundColor="black" mr={4} />
        <Box>
          <Heading as="h1" size="xl" color={'black'} mb={1}>
            Система опросов и обратной связи для студентов
          </Heading>
        </Box>
      </Flex>

      {decodedToken && !isLoginPage && (
        <Flex align="center" gap={3} backgroundColor={'gray.100'} p={2} borderRadius="md" onClick={handleClick} _hover={{ cursor: "pointer" }}>
          <Text>{decodedToken.name}</Text>
          <Box textAlign="right">
            <Text fontSize="sm">{decodedToken.group}</Text>
          </Box>
        </Flex>
      )}
    </Flex>
  )
}