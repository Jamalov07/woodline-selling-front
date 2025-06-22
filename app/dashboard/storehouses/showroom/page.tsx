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

export default function ShowroomPage() {
  const [showrooms, setShowrooms] = useState<Storehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingShowroom, setEditingShowroom] = useState<Storehouse | null>(null)
  const [newShowroomName, setNewShowroomName] = useState("")
  const [editShowroomName, setEditShowroomName] = useState("")
  const { toast } = useToast()

  const fetchShowrooms = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStorehouses({
        type: "showroom",
        pageNumber,
        pageSize,
        name: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setShowrooms(response.data.data)
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
    fetchShowrooms()
  }, [pageNumber, pageSize, searchTerm])

  const handleCreate = async () => {
    if (!newShowroomName.trim()) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Showroom nomini kiriting",
      })
      return
    }

    try {
      const response = await apiService.createStorehouse({
        name: newShowroomName,
        type: "showroom",
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
        setNewShowroomName("")
        fetchShowrooms()
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
        description: "Showroom yaratishda xatolik yuz berdi",
      })
    }
  }

  const handleEdit = async () => {
    if (!editShowroomName.trim() || !editingShowroom) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Showroom nomini kiriting",
      })
      return
    }

    try {
      const response = await apiService.updateStorehouse(editingShowroom.id, {
        name: editShowroomName,
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
        setEditingShowroom(null)
        setEditShowroomName("")
        fetchShowrooms()
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
        description: "Showroom yangilashda xatolik yuz berdi",
      })
    }
  }

  const handleDelete = async (showroom: Storehouse) => {
    try {
      const response = await apiService.deleteStorehouse(showroom.id)

      if (response.success.is) {
        response.success.messages.forEach((message) => {
          toast({
            variant: "success",
            title: "Muvaffaqiyat",
            description: message,
          })
        })
        fetchShowrooms()
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
        description: "Showroom o'chirishda xatolik yuz berdi",
      })
    }
  }

  const openEditModal = (showroom: Storehouse) => {
    setEditingShowroom(showroom)
    setEditShowroomName(showroom.name)
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
          <h1 className="text-3xl font-bold tracking-tight">Showroom</h1>
          <p className="text-muted-foreground">Ko'rgazma zallari ro'yxati va boshqaruv</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Showroom ro'yxati</CardTitle>
          <CardDescription>Barcha showroomlar va ularning ma'lumotlari</CardDescription>
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
                  Yangi showroom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi showroom yaratish</DialogTitle>
                  <DialogDescription>Yangi showroom ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Showroom nomi</Label>
                    <Input
                      id="name"
                      placeholder="Showroom nomini kiriting"
                      value={newShowroomName}
                      onChange={(e) => setNewShowroomName(e.target.value)}
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
              ) : showrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Showroomlar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                showrooms.map((showroom, index) => (
                  <TableRow key={showroom.id}>
                    <TableCell className="font-medium">{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{showroom.name}</TableCell>
                    <TableCell>{formatDateTime(showroom.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(showroom)}>
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
                              <AlertDialogTitle>Showroomni o'chirish</AlertDialogTitle>
                              <AlertDialogDescription>
                                Haqiqatdan ham "{showroom.name}" showroomini o'chirmoqchimisiz? Bu amalni bekor qilib
                                bo'lmaydi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(showroom)}>O'chirish</AlertDialogAction>
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
            <DialogTitle>Showroomni tahrirlash</DialogTitle>
            <DialogDescription>Showroom ma'lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Showroom nomi</Label>
              <Input
                id="edit-name"
                placeholder="Showroom nomini kiriting"
                value={editShowroomName}
                onChange={(e) => setEditShowroomName(e.target.value)}
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
