import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser, login, logout, register } from '../api/energyApi.js'

const AuthContext = createContext(null)

const STORAGE_USER = 'me_user'

const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_USER)
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      if (!user) {
        setAuthChecked(true)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        if (isMounted) {
          if (currentUser) {
            localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser))
            setUser(currentUser)
          } else {
            localStorage.removeItem(STORAGE_USER)
            setUser(null)
          }
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(STORAGE_USER)
          setUser(null)
        }
      } finally {
        if (isMounted) setAuthChecked(true)
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await login({ email, password })
      localStorage.setItem(STORAGE_USER, JSON.stringify(response.user))
      setUser(response.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.data?.detail || error.message }
    }
  }

  const handleRegister = async ({ email, password }) => {
    try {
      await register({ email, password })
      return {
        ok: true,
        message: 'Compte cree. Activez-le avant la premiere connexion.',
      }
    } catch (error) {
      return { ok: false, message: error.data?.detail || error.message }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Even if the API fails, we clear local state to avoid stale sessions.
    }
    localStorage.removeItem(STORAGE_USER)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      authChecked,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, authChecked]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
