"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { validatePhone, getPhoneDigits } from "@/utils/phone-formatter"

export const usePhoneValidation = (phone: string, excludeUserId?: string) => {
  const [isChecking, setIsChecking] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isPhoneValid, setIsPhoneValid] = useState(false)

  useEffect(() => {
    const checkPhone = async () => {
      if (!phone || phone === "998 ") {
        setPhoneError(null)
        setIsPhoneValid(false)
        return
      }

      const digits = getPhoneDigits(phone)

      // Basic validation
      if (!validatePhone(phone)) {
        if (digits.length < 12) {
          setPhoneError("Telefon raqam to'liq kiritilmagan")
        } else {
          setPhoneError("Telefon raqam noto'g'ri formatda")
        }
        setIsPhoneValid(false)
        return
      }

      // Check if phone exists
      try {
        setIsChecking(true)
        setPhoneError(null)

        const response = await apiService.getUsers({
          phone: digits,
          pagination: false,
        })

        if (response.success.is) {
          const existingUsers = response.data.data.filter((user) => (excludeUserId ? user.id !== excludeUserId : true))

          if (existingUsers.length > 0) {
            setPhoneError("Bu telefon raqam allaqachon mavjud")
            setIsPhoneValid(false)
          } else {
            setPhoneError(null)
            setIsPhoneValid(true)
          }
        } else {
          setPhoneError(null)
          setIsPhoneValid(true)
        }
      } catch (error) {
        setPhoneError(null)
        setIsPhoneValid(true) // Allow on error
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkPhone, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [phone, excludeUserId])

  return { isChecking, phoneError, isPhoneValid }
}
