"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  fullname: string
  phone: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  actions: any[]
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: User | null
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://woodline.16.170.250.134.nip.io"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        await fetchProfile()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) throw new Error("No access token")

      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshSuccess = await refreshToken()
        if (refreshSuccess) {
          return await fetchProfile() // Retry with new token
        } else {
          throw new Error("Token refresh failed")
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success?.is && data.data) {
        setUser(data.data)
      } else {
        throw new Error("Profile fetch failed")
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
      clearAuthData()
      throw error
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem("refresh_token")
      if (!refreshTokenValue) return false

      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshTokenValue}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) return false

      const data = await response.json()
      if (data.success?.is && data.data?.tokens) {
        localStorage.setItem("access_token", data.data.tokens.accessToken)
        localStorage.setItem("refresh_token", data.data.tokens.refreshToken)
        return true
      }

      return false
    } catch (error) {
      console.error("Refresh token error:", error)
      return false
    }
  }

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Clean phone number - remove all non-digits and ensure it starts with 998
      let cleanPhone = phone.replace(/\D/g, "")
      if (!cleanPhone.startsWith("998")) {
        cleanPhone = "998" + cleanPhone
      }

      console.log("Attempting login with:", { phone: cleanPhone, password })

      const response = await fetch(`${BASE_URL}/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
          password: password,
        }),
      })

      console.log("Login response status:", response.status)

      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok && data.success?.is && data.data?.user && data.data?.tokens) {
        // Save tokens
        localStorage.setItem("access_token", data.data.tokens.accessToken)
        localStorage.setItem("refresh_token", data.data.tokens.refreshToken)

        // Set user data
        setUser(data.data.user)

        console.log("Login successful, redirecting to dashboard")
        router.push("/dashboard")
        return true
      } else {
        console.error("Login failed:", data.error?.messages || ["Unknown error"])
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")
      if (accessToken) {
        // Call logout endpoint
        await fetch(`${BASE_URL}/auth/sign-out`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearAuthData()
      router.push("/login")
    }
  }

  const clearAuthData = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
  }

  const refreshProfile = async () => {
    try {
      await fetchProfile()
    } catch (error) {
      console.error("Profile refresh error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
