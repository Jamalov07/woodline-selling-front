"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "uz" | "ru" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  uz: {
    // Common
    loading: "Yuklanmoqda...",
    search: "Qidirish...",
    create: "Yaratish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    success: "Muvaffaqiyat",
    error: "Xatolik",
    // Warehouse
    warehouses: "Omborlar",
    warehouse: "Ombor",
    newWarehouse: "Yangi ombor",
    // Showroom
    showrooms: "Showroomlar",
    showroom: "Showroom",
    newShowroom: "Yangi showroom",
  },
  ru: {
    // Common
    loading: "Загрузка...",
    search: "Поиск...",
    create: "Создать",
    edit: "Редактировать",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    confirm: "Подтвердить",
    success: "Успех",
    error: "Ошибка",
    // Warehouse
    warehouses: "Склады",
    warehouse: "Склад",
    newWarehouse: "Новый склад",
    // Showroom
    showrooms: "Шоурумы",
    showroom: "Шоурум",
    newShowroom: "Новый шоурум",
  },
  en: {
    // Common
    loading: "Loading...",
    search: "Search...",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    // Warehouse
    warehouses: "Warehouses",
    warehouse: "Warehouse",
    newWarehouse: "New warehouse",
    // Showroom
    showrooms: "Showrooms",
    showroom: "Showroom",
    newShowroom: "New showroom",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["uz", "ru", "en"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
