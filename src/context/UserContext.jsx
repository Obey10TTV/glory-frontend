import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem('gloryUser')
      ? JSON.parse(localStorage.getItem('gloryUser'))
      : null
  )

  const login = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('gloryUser', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('gloryUser')
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
