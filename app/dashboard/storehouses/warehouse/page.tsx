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
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { apiService, type Storehouse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Storehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Storehouse | null>(null)
  const [newWarehouseName, setNewWarehouseName] = useState("")
  const [editWarehouseName, setEditWarehouseName] = useState("")
  const { toast } = useToast()

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStorehouses({
        type: "warehouse",
        pageNumber,
        pageSize,
        name: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setWarehouses(response.data.data)
        // Use API pagination data if available
        if (response.data.pagesCount) {
          setTotalPages(response.data.pagesCount)
        } else {
          setTotalPages(Math.ceil(response.data.data.length / pageSize) || 1)
        }
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
        description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [pageNumber, pageSize, searchTerm])

  const handleCreate = async () => {
    if (!newWarehouseName.trim()) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Ombor nomini kiriting",
      })
      return
    }

    try {
      const response = await apiService.createStorehouse({
        name: newWarehouseName,
        type: "warehouse",
      })

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        setIsCreateOpen(false)
        setNewWarehouseName("")
        fetchWarehouses()
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
        description: "Ombor yaratishda xatolik yuz berdi",
      })
    }
  }

  const handleEdit = async () => {
    if (!editWarehouseName.trim() || !editingWarehouse) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Ombor nomini kiriting",
      })
      return
    }

    try {
      const response = await apiService.updateStorehouse(editingWarehouse.id, {
        name: editWarehouseName,
      })

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        setIsEditOpen(false)
        setEditingWarehouse(null)
        setEditWarehouseName("")
        fetchWarehouses()
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
        description: "Ombor yangilashda xatolik yuz berdi",
      })
    }
  }

  const handleDelete = async (warehouse: Storehouse) => {
    try {
      const response = await apiService.deleteStorehouse(warehouse.id)

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        fetchWarehouses()
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
        description: "Ombor o'chirishda xatolik yuz berdi",
      })
    }
  }

  const openEditModal = (warehouse: Storehouse) => {
    setEditingWarehouse(warehouse)
    setEditWarehouseName(warehouse.name)
    setIsEditOpen(true)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Omborlar</h1>
          <p className="text-muted-foreground">Omborlar ro'yxati va boshqaruv</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Omborlar ro'yxati</CardTitle>
          <CardDescription>Barcha omborlar va ularning ma'lumotlari</CardDescription>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi ombor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi ombor yaratish</DialogTitle>
                  <DialogDescription>Yangi ombor ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ombor nomi</Label>
                    <Input
                      id="name"
                      placeholder="Ombor nomini kiriting"
                      value={newWarehouseName}
                      onChange={(e) => setNewWarehouseName(e.target.value)}
                    />
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
                <TableHead>Nomi</TableHead>
                <TableHead>Yaratilgan vaqti</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Omborlar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((warehouse, index) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{formatDateTime(warehouse.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(warehouse)}>
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
                              <AlertDialogTitle>Omborni o'chirish</AlertDialogTitle>
                              <AlertDialogDescription>
                                Haqiqatdan ham "{warehouse.name}" omborini o'chirmoqchimisiz? Bu amalni bekor qilib
                                bo'lmaydi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(warehouse)}>O'chirish</AlertDialogAction>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Omborni tahrirlash</DialogTitle>
            <DialogDescription>Ombor ma'lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ombor nomi</Label>
              <Input
                id="edit-name"
                placeholder="Ombor nomini kiriting"
                value={editWarehouseName}
                onChange={(e) => setEditWarehouseName(e.target.value)}
              />
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
