"use client"

import { useState, useEffect } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react"
import { apiService, type User, type Storehouse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { RoleActionTreeSelect } from "@/components/role-action-tree-select"
import { formatPhoneForDisplay, formatPhoneInput } from "@/utils/phone-formatter"
import { usePhoneValidation } from "@/hooks/use-phone-validation"
import { usePhoneFormatter } from "@/hooks/use-phone-formatter"

export default function ProvidersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [warehouses, setWarehouses] = useState<Storehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    phone: "998 ",
    fullname: "",
    password: "",
    source: "",
    storehouseId: "",
  })
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["provider"])
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  // Phone formatter (keeps raw & stripped versions)
  const { rawPhone, setRawPhone, formattedPhone } = usePhoneFormatter("998 ")

  const { toast } = useToast()
  const router = useRouter()

  // Phone validation
  const { isChecking, phoneError, isPhoneValid } = usePhoneValidation(
    formData.phone.replace(/\s/g, ""),
    editingUser?.id,
  )

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers({
        pageNumber,
        pageSize,
        search: searchTerm || undefined,
        roleNames: ["provider"],
      })

      if (response.success.is) {
        setUsers(response.data.data)
        if (response.data.pagesCount) {
          setTotalPages(response.data.pagesCount)
        } else {
          setTotalPages(Math.ceil(response.data.data.length / pageSize) || 1)
        }
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
          description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await apiService.getStorehouses({
        type: "warehouse",
        pagination: false,
      })

      if (response.success.is) {
        setWarehouses(response.data.data)
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
        console.error("Error fetching warehouses:", error)
      }
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchWarehouses()
  }, [pageNumber, pageSize, searchTerm])

  const resetForm = () => {
    setFormData({
      phone: "998 ",
      fullname: "",
      password: "",
      source: "",
      storehouseId: "",
    })
    setRawPhone("998 ")
    setSelectedRoles(["provider"])
    setSelectedActions([])
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value)
    setFormData({ ...formData, phone: formatted })
    setRawPhone(formatted) // NEW – sync with formatter hook
  }

  const handleCreate = async () => {
    if (!formData.phone.trim() || !formData.fullname.trim() || !formData.password.trim()) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring",
      })
      return
    }

    if (!isPhoneValid) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: phoneError || "Telefon raqam noto'g'ri",
      })
      return
    }

    if (selectedRoles.length === 0) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Kamida bitta rolni tanlang",
      })
      return
    }

    try {
      const createData: any = {
        phone: formattedPhone,
        fullname: formData.fullname,
        password: formData.password,
        rolesToConnect: selectedRoles,
        actionsToConnect: selectedActions,
      }

      if (selectedRoles.includes("client") && formData.source) {
        createData.source = formData.source
      }

      // Provider role is default, so storehouseId is always included
      if (formData.storehouseId) {
        createData.storehouseId = formData.storehouseId
      }

      const response = await apiService.createUser(createData)

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        setIsCreateOpen(false)
        resetForm()
        fetchUsers()
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
          description: "Foydalanuvchi yaratishda xatolik yuz berdi",
        })
      }
    }
  }

  const handleEdit = async () => {
    if (!formData.phone.trim() || !formData.fullname.trim() || !editingUser) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring",
      })
      return
    }

    if (!isPhoneValid) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: phoneError || "Telefon raqam noto'g'ri",
      })
      return
    }

    try {
      const currentRoles = editingUser.roles.map((r) => r.name)
      const currentActions = editingUser.actions.map((a) => a.id)

      const rolesToConnect = selectedRoles.filter((role) => !currentRoles.includes(role))
      const rolesToDisconnect = currentRoles.filter((role) => !selectedRoles.includes(role))
      const actionsToConnect = selectedActions.filter((action) => !currentActions.includes(action))
      const actionsToDisconnect = currentActions.filter((action) => !selectedActions.includes(action))

      const updateData: any = {
        phone: formattedPhone,
        fullname: formData.fullname,
        rolesToConnect,
        rolesToDisconnect,
        actionsToConnect,
        actionsToDisconnect,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      if (selectedRoles.includes("client") && formData.source) {
        updateData.source = formData.source
      }

      // Provider role is default, so storehouseId is always included
      if (formData.storehouseId) {
        updateData.storehouseId = formData.storehouseId
      }

      const response = await apiService.updateUser(editingUser.id, updateData)

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        setIsEditOpen(false)
        setEditingUser(null)
        resetForm()
        fetchUsers()
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
          description: "Foydalanuvchi yangilashda xatolik yuz berdi",
        })
      }
    }
  }

  const handleDelete = async (user: User) => {
    try {
      const response = await apiService.deleteUser(user.id)

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        fetchUsers()
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
          description: "Foydalanuvchi o'chirishda xatolik yuz berdi",
        })
      }
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      phone: formatPhoneInput(user.phone),
      fullname: user.fullname,
      password: "",
      source: user.source || "",
      storehouseId: user.storehouseId || "",
    })
    setRawPhone(user.phone)
    setSelectedRoles(user.roles.map((r) => r.name))
    setSelectedActions(user.actions.map((a) => a.id))
    setIsEditOpen(true)
  }

  const handleViewDetails = (user: User) => {
    router.push(`/dashboard/users/providers/${user.id}`)
  }

  const showClientField = selectedRoles.includes("client")
  const showSellerField = selectedRoles.includes("seller")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ta'minotchilar</h1>
          <p className="text-muted-foreground">Ta'minotchilar ro'yxati va shartnomalar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ta'minotchilar ro'yxati</CardTitle>
          <CardDescription>Barcha ta'minotchilar va ularning ma'lumotlari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi ta'minotchi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yangi ta'minotchi yaratish</DialogTitle>
                  <DialogDescription>Yangi ta'minotchi ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon raqam *</Label>
                      <Input
                        id="phone"
                        placeholder="998901234567"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        maxLength={12}
                        onKeyDown={(e) => {
                          if (
                            !/^\d$/.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete" &&
                            e.key !== "ArrowLeft" &&
                            e.key !== "ArrowRight" &&
                            e.key !== "Tab"
                          ) {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullname">To'liq ism *</Label>
                      <Input
                        id="fullname"
                        placeholder="To'liq ismni kiriting"
                        value={formData.fullname}
                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Parol *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Parolni kiriting"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storehouse">Ombor</Label>
                      <Select
                        value={formData.storehouseId}
                        onValueChange={(value) => setFormData({ ...formData, storehouseId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Omborni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(showClientField || showSellerField) && (
                      <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Input
                          id="source"
                          placeholder="Source ni kiriting"
                          value={formData.source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rollar va ruxsatlar</Label>
                      <RoleActionTreeSelect
                        selectedRoles={selectedRoles}
                        selectedActions={selectedActions}
                        onRoleChange={setSelectedRoles}
                        onActionChange={setSelectedActions}
                        defaultSelectedRole="provider"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleCreate}>Yaratish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

        <div className="flex-1 table-container">
          <Table className="table-with-borders">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">№</TableHead>
                <TableHead>To'liq ism</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Ta'minotchilar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{user.fullname}</TableCell>
                    <TableCell>{formatPhoneForDisplay(user.phone)}</TableCell>
                    <TableCell>{user.storehouse?.storehouse?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ta'minotchini o'chirish</AlertDialogTitle>
                              <AlertDialogDescription>
                                Haqiqatdan ham "{user.fullname}" ta'minotchisini o'chirmoqchimisiz? Bu amalni bekor
                                qilib bo'lmaydi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user)}>O'chirish</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

            
          {/* Pagination and Page Size Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sahifada:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Oldingi
              </Button>
              <span className="text-sm text-muted-foreground">
                Sahifa {pageNumber} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber === totalPages}
              >
                Keyingi
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ta'minotchini tahrirlash</DialogTitle>
            <DialogDescription>Ta'minotchi ma'lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefon raqam *</Label>
                <Input
                  id="edit-phone"
                  placeholder="998 91 110 10 10"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={phoneError ? "border-red-500" : ""}
                  onKeyDown={(e) => {
                    if (
                      !/^\d$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight" &&
                      e.key !== "Tab"
                    ) {
                      e.preventDefault()
                    }
                  }}
                />
                {isChecking && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Tekshirilmoqda...
                  </div>
                )}
                {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fullname">To'liq ism *</Label>
                <Input
                  id="edit-fullname"
                  placeholder="To'liq ismni kiriting"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Yangi parol (ixtiyoriy)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Yangi parolni kiriting"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-storehouse">Ombor</Label>
                <Select
                  value={formData.storehouseId}
                  onValueChange={(value) => setFormData({ ...formData, storehouseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Omborni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(showClientField || showSellerField) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-source">Source</Label>
                  <Input
                    id="edit-source"
                    placeholder="Source ni kiriting"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rollar va ruxsatlar</Label>
                <RoleActionTreeSelect
                  selectedRoles={selectedRoles}
                  selectedActions={selectedActions}
                  onRoleChange={setSelectedRoles}
                  onActionChange={setSelectedActions}
                  defaultSelectedRole="provider"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleEdit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
