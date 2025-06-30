"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: "uz" | "ru" | "en") => {
    setLanguage(newLanguage)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-muted-foreground">Tizim sozlamalarini boshqaring</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Umumiy sozlamalar</CardTitle>
            <CardDescription>Asosiy tizim sozlamalari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bildirishnomalar</Label>
                <p className="text-sm text-muted-foreground">Email va push bildirishnomalarni olish</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Avtomatik saqlash</Label>
                <p className="text-sm text-muted-foreground">Ma'lumotlarni avtomatik saqlash</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Til</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">O'zbek tili</SelectItem>
                  <SelectItem value="ru">Русский язык</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xavfsizlik</CardTitle>
            <CardDescription>Hisobingiz xavfsizligi sozlamalari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ikki bosqichli autentifikatsiya</Label>
                <p className="text-sm text-muted-foreground">Qo'shimcha xavfsizlik uchun 2FA yoqish</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sessiya eslatmalari</Label>
                <p className="text-sm text-muted-foreground">Yangi qurilmadan kirganda email yuborish</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
