"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { apiService, type FurnitureType } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function FurnitureTypesPage() {
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFurnitureType, setSelectedFurnitureType] = useState<FurnitureType | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const fetchFurnitureTypes = async () => {
    try {
      setLoading(true)
      const response = await apiService.getFurnitureTypes({
        pageNumber: currentPage,
        pageSize,
        name: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setFurnitureTypes(response.data.data)
        setTotalCount(response.data.totalCount || 0)
        setTotalPages(response.data.pagesCount || 0)
      } else if (response.error.is) {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: response.error.messages.join(", "),
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
    fetchFurnitureTypes()
  }, [currentPage, pageSize, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Nom kiritilishi shart",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiService.createFurnitureType({
        name: formData.name.trim(),
      })

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Mebel turi muvaffaqiyatli yaratildi",
        })
        setIsCreateDialogOpen(false)
        setFormData({ name: "" })
        fetchFurnitureTypes()
      } else if (response.error.is) {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: response.error.messages.join(", "),
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Mebel turini yaratishda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedFurnitureType || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Nom kiritilishi shart",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiService.updateFurnitureType(selectedFurnitureType.id, {
        name: formData.name.trim(),
      })

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Mebel turi muvaffaqiyatli yangilandi",
        })
        setIsUpdateDialogOpen(false)
        setSelectedFurnitureType(null)
        setFormData({ name: "" })
        fetchFurnitureTypes()
      } else if (response.error.is) {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: response.error.messages.join(", "),
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Mebel turini yangilashda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedFurnitureType) return

    try {
      setIsSubmitting(true)
      const response = await apiService.deleteFurnitureType(selectedFurnitureType.id)

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Mebel turi muvaffaqiyatli o'chirildi",
        })
        setIsDeleteDialogOpen(false)
        setSelectedFurnitureType(null)
        fetchFurnitureTypes()
      } else if (response.error.is) {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: response.error.messages.join(", "),
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Mebel turini o'chirishda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUpdateDialog = (furnitureType: FurnitureType) => {
    setSelectedFurnitureType(furnitureType)
    setFormData({ name: furnitureType.name })
    setIsUpdateDialogOpen(true)
  }

  const openDeleteDialog = (furnitureType: FurnitureType) => {
    setSelectedFurnitureType(furnitureType)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "" })
    setSelectedFurnitureType(null)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mebel turlari</h1>
        <p className="text-muted-foreground">Mebel turlari va kategoriyalarni boshqaring</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mebel turlari ro'yxati</CardTitle>
              <CardDescription>Jami {totalCount} ta mebel turi mavjud</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yangi mebel turi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mebel turini qidiring..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex-1 table-container">
            <Table className="table-with-borders">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Yaratilgan sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {furnitureTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Mebel turlari topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  furnitureTypes.map((furnitureType, index) => (
                    <TableRow key={furnitureType.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="font-medium">{furnitureType.name}</TableCell>
                      <TableCell>{new Date(furnitureType.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openUpdateDialog(furnitureType)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(furnitureType)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi mebel turi yaratish</DialogTitle>
            <DialogDescription>Yangi mebel turini yaratish uchun quyidagi ma'lumotlarni kiriting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mebel turi nomini kiriting"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Yaratilmoqda..." : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mebel turini tahrirlash</DialogTitle>
            <DialogDescription>Mebel turi ma'lumotlarini yangilang.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Nomi *</Label>
              <Input
                id="update-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mebel turi nomini kiriting"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false)
                resetForm()
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Haqiqatdan ham o'chirmoqchimisiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni ortga qaytarib bo'lmaydi. "{selectedFurnitureType?.name}" mebel turi butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
