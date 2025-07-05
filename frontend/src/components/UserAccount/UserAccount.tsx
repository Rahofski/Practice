import { Box, Heading, VStack, Text, Flex, Badge } from '@chakra-ui/react';
import { ReviewList } from '../Review/ReviewList';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { UserJwtPayload } from '../../Entity/User';

import { useEffect, useState } from 'react';

export const UserAccount = () => {
  console.log("useracc")
  const token = localStorage.getItem("token");
  const params = useParams();
  console.log("params" , params)
  const userId = params.userId ? Number(params.userId) : undefined;
  console.log("bam", userId)

  const [group, setGroup] = useState<string>("");
  const [semester, setSemester] = useState<number | string>("");
  const [name, setName] = useState<string>("");



  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<UserJwtPayload>(token);
      setName(decodedToken.name);
      setGroup(decodedToken.group);
      setSemester(decodedToken.semester);
    }
  }, [token]);


  if (!token) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="gray.500">
          Пожалуйста, войдите в систему, чтобы просматривать личный аккаунт
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="container.md" mx="auto">
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" mb={2}>
          Профиль пользователя
        </Heading>
        
        {/* Информация о пользователе */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={5}
          bg="white"
          boxShadow="sm"
        >
          <Flex direction="column" gap={3}>
            <Flex align="center">
              <Text fontWeight="bold" minW="120px">Имя:</Text>
              <Text fontSize="lg">{name}</Text>
            </Flex> 
            
            
            <Flex align="center">
              <Text fontWeight="bold" minW="120px">Группа:</Text>
              <Badge 
                colorScheme="blue" 
                fontSize="md" 
                px={3} 
                py={1}
                borderRadius="full"
              >
                {group}
              </Badge>
            </Flex>
            
            
            <Flex align="center">
              <Text fontWeight="bold" minW="120px">Семестр:</Text>
              <Box 
                bg="gray.100" 
                px={3} 
                py={1} 
                borderRadius="md"
              >
                <Text fontSize="md" fontWeight="medium">
                  {semester} семестр
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Box>
        
        {/* Секция с отзывами */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={5}
          bg="white"
          boxShadow="sm"
        >
          <Heading as="h2" size="md" mb={4}>
            Мои отзывы
          </Heading>
          <ReviewList id={userId!} name={name} isAdmin={false} />
        </Box>
      </VStack>
    </Box>
  );
};