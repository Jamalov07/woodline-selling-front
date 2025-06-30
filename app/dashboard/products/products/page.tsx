"use client"

import { useEffect, useState } from "react"
import { useToast } from "../../../../hooks/use-toast"
import { apiService, type Model, type Product } from "../../../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ExtendedProduct extends Product {
  type: "standart" | "nonstandart"
  publicId: string
  tissue: string
  quantity: number
  direction: "left" | "right" | "none"
  description: string
  modelId: string
  model: {
    id: string
    name: string
    furnitureType: {
      id: string
      name: string
    }
    provider: {
      id: string
      fullname: string
      phone: string
    }
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    type: "standart" as "standart" | "nonstandart",
    publicId: "",
    tissue: "",
    quantity: 1,
    direction: "none" as "left" | "right" | "none",
    description: "",
    modelId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modelSearch, setModelSearch] = useState("")
  const [loadingPublicId, setLoadingPublicId] = useState(false)

  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProducts({
        pageNumber: currentPage,
        pageSize,
        search: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setProducts(response.data.data as ExtendedProduct[])
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

  const fetchModels = async (search?: string) => {
    try {
      const response = await apiService.getModels({
        name: search,
        pagination: false,
      })

      if (response.success.is) {
        setModels(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching models:", error)
    }
  }

  const generatePublicId = async () => {
    try {
      setLoadingPublicId(true)
      const response = await apiService.generatePublicId()

      if (response.success.is) {
        setFormData((prev) => ({ ...prev, publicId: response.data.id }))
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Public ID yaratishda xatolik yuz berdi",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Public ID yaratishda xatolik yuz berdi",
      })
    } finally {
      setLoadingPublicId(false)
    }
  }

  const handleCreate = async () => {
    try {
      setIsSubmitting(true)
      const response = await apiService.createProduct({
        type: formData.type,
        publicId: formData.publicId,
        tissue: formData.tissue,
        quantity: formData.quantity,
        direction: formData.direction,
        description: formData.description,
        modelId: formData.modelId,
      })

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Mahsulot muvaffaqiyatli yaratildi",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
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
        description: "Mahsulot yaratishda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedProduct) return

    try {
      setIsSubmitting(true)
      const response = await apiService.updateProduct(selectedProduct.id, {
        type: formData.type,
        publicId: formData.publicId,
        tissue: formData.tissue,
        quantity: formData.quantity,
        direction: formData.direction,
        description: formData.description,
        modelId: formData.modelId,
      })

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Mahsulot muvaffaqiyatli yangilandi",
        })
        setIsUpdateDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
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
        description: "Mahsulot yangilashda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    try {
      const response = await apiService.deleteProduct(selectedProduct.id)

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Mahsulot muvaffaqiyatli o'chirildi",
        })
        setIsDeleteDialogOpen(false)
        setSelectedProduct(null)
        fetchProducts()
      } else {
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
        description: "Mahsulot o'chirishda xatolik yuz berdi",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      type: "standart",
      publicId: "",
      tissue: "",
      quantity: 1,
      direction: "none",
      description: "",
      modelId: "",
    })
    setModelSearch("")
  }

  const openCreateDialog = () => {
    resetForm()
    generatePublicId()
    setIsCreateDialogOpen(true)
  }

  const openUpdateDialog = (product: ExtendedProduct) => {
    setSelectedProduct(product)
    setFormData({
      type: product.type,
      publicId: product.publicId,
      tissue: product.tissue,
      quantity: product.quantity,
      direction: product.direction,
      description: product.description,
      modelId: product.modelId,
    })
    setIsUpdateDialogOpen(true)
  }

  const openViewDialog = (product: ExtendedProduct) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (product: ExtendedProduct) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, pageSize, searchTerm])

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchModels(modelSearch)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [modelSearch])

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case "left":
        return "Chap"
      case "right":
        return "O'ng"
      case "none":
        return "Yo'q"
      default:
        return direction
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "standart":
        return "Standart"
      case "nonstandart":
        return "Nostandart"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mahsulotlar</h1>
        <p className="text-muted-foreground">Barcha mahsulotlar ro'yxati</p>
      </div>

      {/* Search and Create Button */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulotlarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi mahsulot
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="table-with-borders">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">№</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Public ID</TableHead>
                <TableHead>To'qima</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Yo'nalish</TableHead>
                <TableHead>Tavsif</TableHead>
                <TableHead>Model / Mebel turi</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Mahsulotlar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>
                      <Badge variant={product.type === "standart" ? "default" : "secondary"}>
                        {getTypeText(product.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.publicId}</TableCell>
                    <TableCell>{product.tissue}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{getDirectionText(product.direction)}</TableCell>
                    <TableCell className="max-w-32 truncate">{product.description}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{product.model?.name}</div>
                        <div className="text-sm text-muted-foreground">{product.model?.furnitureType?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openViewDialog(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openUpdateDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Jami {totalCount} ta mahsulot, {totalPages} sahifa
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Oldingi
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yangi mahsulot yaratish</DialogTitle>
            <DialogDescription>Yangi mahsulot ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Turi</Label>
              <Select value={formData.type} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standart">Standart</SelectItem>
                  <SelectItem value="nonstandart">Nostandart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicId">Public ID</Label>
              <Input value={formData.publicId} disabled placeholder={loadingPublicId ? "Yuklanmoqda..." : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tissue">To'qima</Label>
              <Input
                value={formData.tissue}
                onChange={(e) => setFormData((prev) => ({ ...prev, tissue: e.target.value }))}
                placeholder="To'qima nomi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Miqdor</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction">Yo'nalish</Label>
              <Select
                value={formData.direction}
                onValueChange={(value: "left" | "right" | "none") =>
                  setFormData((prev) => ({ ...prev, direction: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yo'q</SelectItem>
                  <SelectItem value="left">Chap</SelectItem>
                  <SelectItem value="right">O'ng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelId">Model</Label>
              <Select
                value={formData.modelId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, modelId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Model tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Model qidirish..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                    />
                  </div>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.furnitureType?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mahsulot tavsifi"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mahsulotni yangilash</DialogTitle>
            <DialogDescription>Mahsulot ma'lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Turi</Label>
              <Input value={getTypeText(formData.type)} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicId">Public ID</Label>
              <Input value={formData.publicId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tissue">To'qima</Label>
              <Input
                value={formData.tissue}
                onChange={(e) => setFormData((prev) => ({ ...prev, tissue: e.target.value }))}
                placeholder="To'qima nomi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Miqdor</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction">Yo'nalish</Label>
              <Select
                value={formData.direction}
                onValueChange={(value: "left" | "right" | "none") =>
                  setFormData((prev) => ({ ...prev, direction: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yo'q</SelectItem>
                  <SelectItem value="left">Chap</SelectItem>
                  <SelectItem value="right">O'ng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelId">Model</Label>
              <Select
                value={formData.modelId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, modelId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Model tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Model qidirish..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                    />
                  </div>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.furnitureType?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Mahsulot tavsifi"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Yangilanmoqda..." : "Yangilash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mahsulot ma'lumotlari</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turi</Label>
                <Badge variant={selectedProduct.type === "standart" ? "default" : "secondary"}>
                  {getTypeText(selectedProduct.type)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Public ID</Label>
                <p className="font-mono text-sm">{selectedProduct.publicId}</p>
              </div>
              <div className="space-y-2">
                <Label>To'qima</Label>
                <p>{selectedProduct.tissue}</p>
              </div>
              <div className="space-y-2">
                <Label>Miqdor</Label>
                <p>{selectedProduct.quantity}</p>
              </div>
              <div className="space-y-2">
                <Label>Yo'nalish</Label>
                <p>{getDirectionText(selectedProduct.direction)}</p>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <div>
                  <p className="font-medium">{selectedProduct.model?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.model?.furnitureType?.name}</p>
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Tavsif</Label>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Yaratilgan sana</Label>
                <p className="text-sm">{new Date(selectedProduct.createdAt).toLocaleDateString("uz-UZ")}</p>
              </div>
              <div className="space-y-2">
                <Label>Yangilangan sana</Label>
                <p className="text-sm">{new Date(selectedProduct.updatedAt).toLocaleDateString("uz-UZ")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.
              {selectedProduct && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <p>
                    <strong>Public ID:</strong> {selectedProduct.publicId}
                  </p>
                  <p>
                    <strong>To'qima:</strong> {selectedProduct.tissue}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
