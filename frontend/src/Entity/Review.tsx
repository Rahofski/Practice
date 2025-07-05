export interface Review {
  id: number
  courseId: number
  group: string
  name: string
  difficulty: number // 1-10 scale
  actuality: number // 1-10 scale
  teacherQuality: number // 1-10 scale
  overall: string // Overall review text
  createdDate: string // ISO date string
}
