import { useEffect, useState } from "react"
import { authService } from "@/services/auth"
import { usersService } from "@/services/users"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const accessToken = authService.getAccessToken()
        setToken(accessToken)

        if (accessToken) {
          const currentUser = await usersService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (err) {
        setError(err.message || "Ошибка при загрузке пользователя")
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
  }
}

