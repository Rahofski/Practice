export interface UserJwtPayload {
  id: number
  name: string
  group: string
  semester: number
  isAdmin: boolean
}


export interface UserJwtData {
  sub: number
  roles:string[]
}