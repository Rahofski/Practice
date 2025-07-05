// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('token'))
  }, [])

  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
