import { createContext, useState, useContext } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem('gloryUser')
      ? JSON.parse(localStorage.getItem('gloryUser'))
      : null
  )

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('gloryUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gloryUser')
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)