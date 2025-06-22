"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react"
import { apiService, type Role, type Action } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function RoleDetailPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [allActions, setAllActions] = useState<Action[]>([])
  const [filteredActions, setFilteredActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [disconnectingAction, setDisconnectingAction] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const roleName = decodeURIComponent(params.name as string)

  const fetchRole = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRole(roleName)

      if (response.success.is) {
        setRole(response.data)
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
        description: "Role ma'lumotlarini yuklashda xatolik yuz berdi",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllActions = useCallback(
    async (search?: string) => {
      try {
        const response = await apiService.getActions({
          pagination: false,
          name: search || undefined,
        })

        if (response.success.is) {
          setAllActions(response.data.data)
          // Filter out actions that are already connected to this role
          const availableActions = response.data.data.filter(
            (action) => !role?.actions.some((roleAction) => roleAction.id === action.id),
          )
          setFilteredActions(availableActions)
        }
      } catch (error) {
        console.error("Error fetching actions:", error)
      }
    },
    [role],
  )

  useEffect(() => {
    fetchRole()
  }, [roleName])

  useEffect(() => {
    if (role) {
      fetchAllActions(searchTerm)
    }
  }, [role, searchTerm, fetchAllActions])

  const handleConnect = async () => {
    if (selectedActions.length === 0) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Kamida bitta amalni tanlang",
      })
      return
    }

    try {
      const response = await apiService.updateRole(roleName, {
        actionsToConnect: selectedActions,
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
        setSelectedActions([])
        setSearchTerm("")
        fetchRole()
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
          description: "Amallarni bog'lashda xatolik yuz berdi",
        })
      }
    }
  }

  const handleDisconnect = async (actionId: string) => {
    try {
      const response = await apiService.updateRole(roleName, {
        actionsToDisconnect: [actionId],
      })

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        fetchRole()
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
          description: "Amal uzishda xatolik yuz berdi",
        })
      }
    } finally {
      setDisconnectingAction(null)
    }
  }

  const handleActionToggle = (actionId: string) => {
    setSelectedActions((prev) => (prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]))
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Role topilmadi</div>
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
          <h1 className="text-3xl font-bold tracking-tight">{role.name} roli</h1>
          <p className="text-muted-foreground">Role batafsil ma'lumotlari va bog'langan amallar</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role ma'lumotlari</CardTitle>
            <CardDescription>Asosiy role ma'lumotlari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label className="text-sm font-medium">Role nomi</Label>
                <p className="text-lg font-semibold">{role.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Bog'langan amallar soni</Label>
                <p className="text-lg font-semibold">{role.actions.length} ta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Bog'langan amallar</CardTitle>
                <CardDescription>Ushbu rolega bog'langan barcha amallar</CardDescription>
              </div>
              <Button onClick={() => setIsConnectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Amal bog'lash
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {role.actions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hech qanday amal bog'lanmagan</p>
              </div>
            ) : (
              <div className="table-with-borders">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">№</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Tavsif</TableHead>
                      <TableHead>Yaratilgan</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {role.actions.map((action, index) => (
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
                        <TableCell>{formatDateTime(action.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Amalni uzish</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Haqiqatdan ham "{action.name}" amalini "{role.name}" rolidan uzmoqchimisiz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDisconnect(action.id)}>Uzish</AlertDialogAction>
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

      {/* Connect Actions Modal */}
      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Amallarni bog'lash</DialogTitle>
            <DialogDescription>Rolega yangi amallarni bog'lang (bir nechta tanlash mumkin)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-2 bg-muted rounded-md">
                <span className="font-medium">{role.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amallarni qidirish</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Amal nomi bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amallar ({selectedActions.length} tanlangan)</Label>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {filteredActions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "Qidiruv bo'yicha amallar topilmadi" : "Bog'lash uchun amallar yo'q"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActions.map((action, index) => (
                      <div key={action.id}>
                        <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                          <Checkbox
                            id={action.id}
                            checked={selectedActions.includes(action.id)}
                            onCheckedChange={() => handleActionToggle(action.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodBadgeColor(
                                  action.method,
                                )}`}
                              >
                                {action.method.toUpperCase()}
                              </span>
                              <span className="font-mono text-sm">{action.url}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{action.name}</span>
                              {action.description && <span> - {action.description}</span>}
                            </div>
                          </div>
                        </div>
                        {index < filteredActions.length - 1 && <Separator className="my-2" />}
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
                setSelectedActions([])
                setSearchTerm("")
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleConnect} disabled={selectedActions.length === 0}>
              Bog'lash ({selectedActions.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
