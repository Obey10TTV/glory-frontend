import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getUserProfile, logoutUser } from '../api'

const UserContext = createContext()

const readCachedUser = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('gloryUser') || 'null')
    if (!parsed) return null
    const { token, ...profile } = parsed
    return profile
  } catch (error) {
    return null
  }
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(readCachedUser)
  const [authLoading, setAuthLoading] = useState(true)

  const login = useCallback((userData) => {
    const { token, ...profile } = userData || {}
    setUser(profile)
    localStorage.setItem('gloryUser', JSON.stringify(profile))
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    localStorage.removeItem('gloryUser')
  }, [])

  const logout = useCallback(async () => {
    clearUser()
    try {
      await logoutUser()
    } catch (error) {
      // Local state is still cleared if the API is unavailable.
    } finally {
      sessionStorage.removeItem('gloryCsrfToken')
    }
  }, [clearUser])

  useEffect(() => {
    let active = true
    getUserProfile()
      .then(({ data }) => {
        if (active) login(data)
      })
      .catch(() => {
        if (active) clearUser()
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })

    const onExpired = () => clearUser()
    window.addEventListener('glory:auth-expired', onExpired)
    return () => {
      active = false
      window.removeEventListener('glory:auth-expired', onExpired)
    }
  }, [clearUser, login])

  const value = useMemo(
    () => ({ user, authLoading, login, logout }),
    [user, authLoading, login, logout]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
