"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { apiService, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { formatPhoneForDisplay } from "@/utils/phone-formatter"

export default function AdminDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUser(userId)

      if (response.success.is) {
        setUser(response.data)
      }

      if (response.error.is) {
        response.error.messages.forEach((message) => {
          toast({
            variant: "destructive",
            title: "Xatolik",
            description: message,
          })
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Foydalanuvchi ma'lumotlarini yuklashda xatolik yuz berdi",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  const getMethodBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "get":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "post":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "put":
      case "patch":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Foydalanuvchi topilmadi</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Orqaga
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.fullname}</h1>
          <p className="text-muted-foreground">Admin batafsil ma'lumotlari</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
            <CardDescription>Asosiy foydalanuvchi ma'lumotlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label className="text-sm font-medium">To'liq ism</Label>
                <p className="text-lg font-semibold">{user.fullname}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Telefon raqam</Label>
                <p className="text-lg">{formatPhoneForDisplay(user.phone)}</p>
              </div>
              {user.source && (
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-lg">{user.source}</p>
                </div>
              )}
              {user.storehouseId && (
                <div>
                  <Label className="text-sm font-medium">Ombor ID</Label>
                  <p className="text-lg">{user.storehouseId}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Yaratilgan vaqti</Label>
                <p className="text-lg">{formatDateTime(user.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Oxirgi yangilanish</Label>
                <p className="text-lg">{formatDateTime(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rollar</CardTitle>
            <CardDescription>Foydalanuvchiga tayinlangan rollar</CardDescription>
          </CardHeader>
          <CardContent>
            {user.roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hech qanday rol tayinlanmagan</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role.name}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ruxsatlar</CardTitle>
            <CardDescription>Foydalanuvchiga berilgan maxsus ruxsatlar</CardDescription>
          </CardHeader>
          <CardContent>
            {user.actions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hech qanday maxsus ruxsat berilmagan</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">№</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Tavsif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.actions.map((action, index) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{action.url}</TableCell>
                      <TableCell>{action.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadgeColor(
                            action.method,
                          )}`}
                        >
                          {action.method.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{action.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
