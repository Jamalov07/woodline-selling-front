"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Shaxsiy ma'lumotlaringizni boshqaring</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="relative bg-muted p-1 rounded-lg">
          <div
            className={`absolute top-1 bottom-1 bg-background rounded-md shadow-sm transition-all duration-200 ${
              activeTab === "profile" ? "left-1 right-1/2" : "left-1/2 right-1"
            }`}
          />
          <div className="relative flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2 text-sm font-medium transition-colors relative z-10 ${
                activeTab === "profile" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profil ma'lumotlari
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-6 py-2 text-sm font-medium transition-colors relative z-10 ${
                activeTab === "password" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Parolni o'zgartirish
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" ? (
        <Card>
          <CardHeader>
            <CardTitle>Profil ma'lumotlari</CardTitle>
            <CardDescription>Shaxsiy ma'lumotlaringizni yangilang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt="Profil rasmi" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline">Rasm o'zgartirish</Button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">To'liq ism</Label>
                <Input id="name" placeholder="Ismingizni kiriting" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <Input id="phone" placeholder="+998 90 123 45 67" />
              </div>
            </div>

            <Button>O'zgarishlarni saqlash</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Parolni o'zgartirish</CardTitle>
            <CardDescription>Xavfsizlik uchun parolingizni muntazam yangilang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Joriy parol</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Yangi parol</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Yangi parolni tasdiqlang</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Parolni yangilash</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
