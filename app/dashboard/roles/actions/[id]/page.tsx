"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { apiService, type Action, type Role } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function ActionDetailPage() {
  const [action, setAction] = useState<Action | null>(null)
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [disconnectingRole, setDisconnectingRole] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const actionId = params.id as string

  const fetchAction = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAction(actionId)

      if (response.success.is) {
        setAction(response.data)
      }

      if (!response.success.is && response.error.is) {
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
        description: "Amal ma'lumotlarini yuklashda xatolik yuz berdi",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllRoles = async () => {
    try {
      const response = await apiService.getRoles({
        pagination: false,
      })

      if (response.success.is) {
        setAllRoles(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  useEffect(() => {
    fetchAction()
    fetchAllRoles()
  }, [actionId])

  const handleConnect = async () => {
    if (selectedRoles.length === 0) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Kamida bitta rolni tanlang",
      })
      return
    }

    try {
      const response = await apiService.updateAction(actionId, {
        rolesToConnect: selectedRoles,
      })

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        setIsConnectOpen(false)
        setSelectedRoles([])
        fetchAction()
      }

      if (!response.success.is && response.error.is) {
        response.error.messages.forEach((message) => {
          toast({
            variant: "destructive",
            title: "Xatolik",
            description: message,
          })
        })
      }
    } catch (error: any) {
      if (error.response?.data?.error?.is) {
        error.response.data.error.messages.forEach((message: string) => {
          toast({
            variant: "destructive",
            title: "Xatolik",
            description: message,
          })
        })
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Rollarni bog'lashda xatolik yuz berdi",
        })
      }
    }
  }

  const handleDisconnect = async (roleName: string) => {
    try {
      const response = await apiService.updateAction(actionId, {
        rolesToDisconnect: [roleName],
      })

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        fetchAction()
      }

      if (!response.success.is && response.error.is) {
        response.error.messages.forEach((message) => {
          toast({
            variant: "destructive",
            title: "Xatolik",
            description: message,
          })
        })
      }
    } catch (error: any) {
      if (error.response?.data?.error?.is) {
        error.response.data.error.messages.forEach((message: string) => {
          toast({
            variant: "destructive",
            title: "Xatolik",
            description: message,
          })
        })
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Rolni uzishda xatolik yuz berdi",
        })
      }
    } finally {
      setDisconnectingRole(null)
    }
  }

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((name) => name !== roleName) : [...prev, roleName],
    )
  }

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

  // Get available roles (not already connected to this action)
  const availableRoles = allRoles.filter((role) => !action?.roles?.some((actionRole) => actionRole.name === role.name))

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!action) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Amal topilmadi</div>
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
          <h1 className="text-3xl font-bold tracking-tight">{action.name} amali</h1>
          <p className="text-muted-foreground">Amal batafsil ma'lumotlari va bog'langan rollar</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Amal ma'lumotlari</CardTitle>
            <CardDescription>Asosiy amal ma'lumotlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label className="text-sm font-medium">Amal nomi</Label>
                <p className="text-lg font-semibold">{action.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">URL</Label>
                <p className="text-lg font-mono">{action.url}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Method</Label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodBadgeColor(
                    action.method,
                  )}`}
                >
                  {action.method.toUpperCase()}
                </span>
              </div>
              <div>
                <Label className="text-sm font-medium">Tavsif</Label>
                <p className="text-lg">{action.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Yaratilgan vaqti</Label>
                <p className="text-lg">{formatDateTime(action.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Bog'langan rollar soni</Label>
                <p className="text-lg font-semibold">{action.roles?.length || 0} ta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Bog'langan rollar</CardTitle>
                <CardDescription>Ushbu amalga bog'langan barcha rollar</CardDescription>
              </div>
              <Button onClick={() => setIsConnectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Rol bog'lash
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!action.roles || action.roles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hech qanday rol bog'lanmagan</p>
              </div>
            ) : (
              <div className="table-with-borders">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">№</TableHead>
                      <TableHead>Role nomi</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {action.roles.map((role, index) => (
                      <TableRow key={role.name}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold">{role.name}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rolni uzish</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Haqiqatdan ham "{role.name}" rolini "{action.name}" amalidan uzmoqchimisiz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDisconnect(role.name)}>Uzish</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connect Roles Modal */}
      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rollarni bog'lash</DialogTitle>
            <DialogDescription>Amalga yangi rollarni bog'lang (bir nechta tanlash mumkin)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amal</Label>
              <div className="p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodBadgeColor(
                      action.method,
                    )}`}
                  >
                    {action.method.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm">{action.url}</span>
                  <span>- {action.name}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rollar ({selectedRoles.length} tanlangan)</Label>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {availableRoles.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Bog'lash uchun rollar yo'q</div>
                ) : (
                  <div className="space-y-2">
                    {availableRoles.map((role, index) => (
                      <div key={role.name}>
                        <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                          <Checkbox
                            id={role.name}
                            checked={selectedRoles.includes(role.name)}
                            onCheckedChange={() => handleRoleToggle(role.name)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {role.actions.length} ta amal bog'langan
                            </div>
                          </div>
                        </div>
                        {index < availableRoles.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConnectOpen(false)
                setSelectedRoles([])
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleConnect} disabled={selectedRoles.length === 0}>
              Bog'lash ({selectedRoles.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
