import { useParams } from 'react-router-dom'
import { ReviewList } from './ReviewList'
import { useSummary } from '../../api/handleGetSummary'
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  Card,
  CardBody,
  Heading,
  Spinner,
} from '@chakra-ui/react'
import { Alert, AlertIcon } from '@chakra-ui/alert'
import {useToast} from '@chakra-ui/toast'
import { Brain } from 'lucide-react'

export const AdminReviewPage = () => {
  const { courseId } = useParams()
  const parsedCourseId = Number(courseId)
  const { generateSummary, summary, isGenerating, error, isSuccess, reset } = useSummary()
  const toast = useToast()

  const handleGenerateSummary = () => {
    if (!parsedCourseId || isNaN(parsedCourseId)) {
      toast({
        title: 'Ошибка',
        description: 'Некорректный ID курса',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    generateSummary(parsedCourseId)
  }

  const handleResetSummary = () => {
    reset()
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Список отзывов */}
      <ReviewList isAdmin={true} id={parsedCourseId} name=""/>
      
      {/* Секция с генерацией сводки */}
      <Box p={6}>
        <VStack gap={4} align="stretch">
          <Heading as="h3" size="md" display="flex" alignItems="center" gap={2}>
            <Brain size={24} />
            Сводка от нейросети
          </Heading>
          
          {/* Кнопки управления */}
          <Box display="flex" gap={3} flexWrap="wrap">
            <Button
              onClick={handleGenerateSummary}
              loading={isGenerating}
              loadingText="Генерация..."
              colorScheme="blue"
              disabled={!parsedCourseId || isNaN(parsedCourseId)}
            >
              Сгенерировать сводку
            </Button>
            
            {(summary || error) && (
              <Button
                onClick={handleResetSummary}
                variant="outline"
              >
                Сбросить
              </Button>
            )}
          </Box>

          {/* Состояние загрузки */}
          {isGenerating && (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              py={8}
              borderRadius="md"
              bg="blue.50"
              _dark={{ bg: 'blue.900' }}
            >
              <Spinner size="lg" color="blue.500" mr={4} />
              <Text fontSize="lg" color="blue.600" _dark={{ color: 'blue.300' }}>
                Нейросеть анализирует отзывы...
              </Text>
            </Box>
          )}

          {/* Отображение ошибки */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontWeight="bold">Ошибка генерации сводки</Text>
                <Text fontSize="sm">{error.message}</Text>
              </Box>
            </Alert>
          )}

          {/* Отображение сводки */}
          {isSuccess && summary && (
            <Card.Root>
              <CardBody>
                <Text 
                  fontSize="md" 
                  lineHeight="1.6" 
                  whiteSpace="pre-wrap"
                  color="gray.700"
                  _dark={{ color: 'gray.300' }}
                >
                  {summary}
                </Text>
              </CardBody>
            </Card.Root>
          )}

          {/* Пустое состояние */}
          {!summary && !error && !isGenerating && (
            <Text 
              textAlign="center" 
              color="gray.500" 
              fontSize="md"
              py={4}
            >
              Нажмите кнопку выше, чтобы сгенерировать сводку по отзывам
            </Text>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}