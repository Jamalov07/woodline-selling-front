"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Phone, Lock, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone || !password) {
      setError("Telefon raqam va parolni kiriting")
      return
    }

    try {
      const success = await login(phone, password)
      if (!success) {
        setError("Telefon raqam yoki parol noto'g'ri")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Tizimga kirishda xatolik yuz berdi")
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as 998 XX XXX XX XX
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    if (digits.length <= 10)
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhoneNumber(value)
    setPhone(formatted)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
          <CardDescription className="text-center">
            Hisobingizga kirish uchun ma'lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="998 XX XXX XX XX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !phone || !password}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </div>
              ) : (
                "Kirish"
              )}
            </Button>
          </form>

          {/* Debug info - remove in production */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p>Debug: Phone = {phone}</p>
            <p>Debug: Clean phone = {phone.replace(/\D/g, "")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
