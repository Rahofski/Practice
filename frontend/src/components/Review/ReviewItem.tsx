import type { Review } from '../../Entity/Review'
import { Text, Box, Stack, Flex } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Tag, TagLabel } from '@chakra-ui/tag'
import { StarIcon } from '@chakra-ui/icons'

export const ReviewItem = ({ review }: { review: Review }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      mb={4}
    >
      <Flex align="center" mb={3}>
        <Box>
          <Flex gap={5}>
            <Text fontWeight="bold">{review.name}</Text>
            <Text fontWeight="bold">{review.group}</Text>
          </Flex>
          <Text fontSize="sm" color="gray.500">
            {new Date(review.createdDate).toLocaleDateString()}
          </Text>
        </Box>
      </Flex>

      <Stack direction="row" mb={3} gap={4}>
        <Tag colorScheme="teal">
          <TagLabel>Сложность: {review.difficulty}/10</TagLabel>
          <StarIcon ml={1} />
        </Tag>
        <Tag colorScheme="blue">
          <TagLabel>Актуальность: {review.actuality}/10</TagLabel>
          <StarIcon ml={1} />
        </Tag>
        <Tag colorScheme="purple">
          <TagLabel>Качество преподавания: {review.teacherQuality}/10</TagLabel>
          <StarIcon ml={1} />
        </Tag>
      </Stack>

      <Text mt={2}>{review.overall}</Text>
    </Box>
  )
}
