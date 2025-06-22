"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Bu yerda backend API ga so'rov yuboriladi
      // Hozircha mock data bilan ishlayapman

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful login
      if (phone && password) {
        const mockUser: User = {
          id: "1",
          name: "John Doe",
          phone: phone,
          avatar: "/placeholder.svg?height=40&width=40",
          role: "admin",
        }

        // Save tokens and user data
        localStorage.setItem("access_token", "mock_access_token")
        localStorage.setItem("refresh_token", "mock_refresh_token")
        localStorage.setItem("user_data", JSON.stringify(mockUser))

        setUser(mockUser)
        router.push("/dashboard")
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    setUser(null)
    router.push("/login")
  }

  // Refresh token logic
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) return false

      // Bu yerda backend ga refresh token so'rovi yuboriladi
      // Hozircha mock

      return true
    } catch (error) {
      console.error("Refresh token error:", error)
      logout()
      return false
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
