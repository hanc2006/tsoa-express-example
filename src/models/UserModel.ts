export interface User {
  id: number
  email: string
  name: string
  status?: 'Happy' | 'Sad'
  phoneNumbers: string[],
  // managers: Manager[]
}

// export interface Manager {
//   id: number
//   name: string
//   phoneNumbers: string[],
// }