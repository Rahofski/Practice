import type { UserJwtPayload } from '../Entity/User'

export const Users: UserJwtPayload[] = [
  {
    id:1,
    name: 'John Doe',
    group: '5130903/30003',
    semester: 5,
    isAdmin: false,
  },
  {
    id:2,
    name: 'Jane Smith',
    group: '5130903/30002',
    semester: 5,
    isAdmin: false,
  },
  {
    id:3,
    name: 'Alice Johnson',
    group: '5130903/30001',
    semester: 4,
    isAdmin: false,
  },
  {
    id:4,
    name: 'Bob Brown',
    group: '5130903/20002',
    semester: 3,
    isAdmin: false,
  },
  {
    id:5,
    name: 'Charlie Davis',
    group: '5130903/20001',
    semester: 2,
    isAdmin: false,
  },
]
