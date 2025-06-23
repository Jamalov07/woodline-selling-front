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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react"
import { apiService, type Model, type FurnitureType, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatPhoneForDisplay } from "@/utils/phone-formatter"

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [providers, setProviders] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    furnitureTypeId: "",
    providerId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Combobox states
  const [furnitureTypeOpen, setFurnitureTypeOpen] = useState(false)
  const [providerOpen, setProviderOpen] = useState(false)
  const [furnitureTypeSearch, setFurnitureTypeSearch] = useState("")
  const [providerSearch, setProviderSearch] = useState("")

  const { toast } = useToast()

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await apiService.getModels({
        pageNumber: currentPage,
        pageSize,
        name: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setModels(response.data.data)
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

  const fetchFurnitureTypes = async (search?: string) => {
    try {
      const response = await apiService.getFurnitureTypes({
        name: search,
        pagination: false,
      })

      if (response.success.is) {
        setFurnitureTypes(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching furniture types:", error)
    }
  }

  const fetchProviders = async (search?: string) => {
    try {
      const response = await apiService.getUsers({
        roleNames: ["provider"],
        search,
        pagination: false,
      })

      if (response.success.is) {
        setProviders(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [currentPage, pageSize, searchTerm])

  useEffect(() => {
    fetchFurnitureTypes()
    fetchProviders()
  }, [])

  useEffect(() => {
    if (furnitureTypeSearch) {
      fetchFurnitureTypes(furnitureTypeSearch)
    }
  }, [furnitureTypeSearch])

  useEffect(() => {
    if (providerSearch) {
      fetchProviders(providerSearch)
    }
  }, [providerSearch])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.furnitureTypeId || !formData.providerId) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha maydonlar to'ldirilishi shart",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiService.createModel({
        name: formData.name.trim(),
        furnitureTypeId: formData.furnitureTypeId,
        providerId: formData.providerId,
      })

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Model muvaffaqiyatli yaratildi",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchModels()
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
        description: "Modelni yaratishda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedModel || !formData.name.trim() || !formData.furnitureTypeId || !formData.providerId) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha maydonlar to'ldirilishi shart",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiService.updateModel(selectedModel.id, {
        name: formData.name.trim(),
        furnitureTypeId: formData.furnitureTypeId,
        providerId: formData.providerId,
      })

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Model muvaffaqiyatli yangilandi",
        })
        setIsUpdateDialogOpen(false)
        resetForm()
        fetchModels()
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
        description: "Modelni yangilashda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedModel) return

    try {
      setIsSubmitting(true)
      const response = await apiService.deleteModel(selectedModel.id)

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Model muvaffaqiyatli o'chirildi",
        })
        setIsDeleteDialogOpen(false)
        setSelectedModel(null)
        fetchModels()
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
        description: "Modelni o'chirishda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUpdateDialog = (model: Model) => {
    setSelectedModel(model)
    setFormData({
      name: model.name,
      furnitureTypeId: model.furnitureType.id,
      providerId: model.provider.id,
    })
    setIsUpdateDialogOpen(true)
  }

  const openDeleteDialog = (model: Model) => {
    setSelectedModel(model)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      furnitureTypeId: "",
      providerId: "",
    })
    setSelectedModel(null)
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
        <h1 className="text-3xl font-bold tracking-tight">Modellar</h1>
        <p className="text-muted-foreground">Mahsulot modellari va dizaynlarini boshqaring</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modellar ro'yxati</CardTitle>
              <CardDescription>Jami {totalCount} ta model mavjud</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yangi model
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Modelni qidiring..."
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
                  <TableHead>Mebel turi</TableHead>
                  <TableHead>Ta'minotchi</TableHead>
                  <TableHead>Yaratilgan sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Modellar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model, index) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{model.furnitureType.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{model.provider.fullname}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPhoneForDisplay(model.provider.phone)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(model.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openUpdateDialog(model)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(model)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi model yaratish</DialogTitle>
            <DialogDescription>Yangi modelni yaratish uchun quyidagi ma'lumotlarni kiriting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Model nomini kiriting"
              />
            </div>

            <div className="space-y-2">
              <Label>Mebel turi *</Label>
              <Popover open={furnitureTypeOpen} onOpenChange={setFurnitureTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={furnitureTypeOpen}
                    className="w-full justify-between"
                  >
                    {formData.furnitureTypeId
                      ? furnitureTypes.find((type) => type.id === formData.furnitureTypeId)?.name
                      : "Mebel turini tanlang..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Mebel turini qidiring..."
                      value={furnitureTypeSearch}
                      onValueChange={setFurnitureTypeSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Mebel turi topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {furnitureTypes.map((type) => (
                          <CommandItem
                            key={type.id}
                            value={type.name}
                            onSelect={() => {
                              setFormData({ ...formData, furnitureTypeId: type.id })
                              setFurnitureTypeOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.furnitureTypeId === type.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ta'minotchi *</Label>
              <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={providerOpen}
                    className="w-full justify-between"
                  >
                    {formData.providerId
                      ? providers.find((provider) => provider.id === formData.providerId)?.fullname
                      : "Ta'minotchini tanlang..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Ta'minotchini qidiring..."
                      value={providerSearch}
                      onValueChange={setProviderSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Ta'minotchi topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {providers.map((provider) => (
                          <CommandItem
                            key={provider.id}
                            value={provider.fullname}
                            onSelect={() => {
                              setFormData({ ...formData, providerId: provider.id })
                              setProviderOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.providerId === provider.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div>
                              <div>{provider.fullname}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatPhoneForDisplay(provider.phone)}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modelni tahrirlash</DialogTitle>
            <DialogDescription>Model ma'lumotlarini yangilang.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-name">Nomi *</Label>
              <Input
                id="update-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Model nomini kiriting"
              />
            </div>

            <div className="space-y-2">
              <Label>Mebel turi *</Label>
              <Popover open={furnitureTypeOpen} onOpenChange={setFurnitureTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={furnitureTypeOpen}
                    className="w-full justify-between"
                  >
                    {formData.furnitureTypeId
                      ? furnitureTypes.find((type) => type.id === formData.furnitureTypeId)?.name
                      : "Mebel turini tanlang..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Mebel turini qidiring..."
                      value={furnitureTypeSearch}
                      onValueChange={setFurnitureTypeSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Mebel turi topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {furnitureTypes.map((type) => (
                          <CommandItem
                            key={type.id}
                            value={type.name}
                            onSelect={() => {
                              setFormData({ ...formData, furnitureTypeId: type.id })
                              setFurnitureTypeOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.furnitureTypeId === type.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ta'minotchi *</Label>
              <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={providerOpen}
                    className="w-full justify-between"
                  >
                    {formData.providerId
                      ? providers.find((provider) => provider.id === formData.providerId)?.fullname
                      : "Ta'minotchini tanlang..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Ta'minotchini qidiring..."
                      value={providerSearch}
                      onValueChange={setProviderSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Ta'minotchi topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {providers.map((provider) => (
                          <CommandItem
                            key={provider.id}
                            value={provider.fullname}
                            onSelect={() => {
                              setFormData({ ...formData, providerId: provider.id })
                              setProviderOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.providerId === provider.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div>
                              <div>{provider.fullname}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatPhoneForDisplay(provider.phone)}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              Bu amalni ortga qaytarib bo'lmaydi. "{selectedModel?.name}" modeli butunlay o'chiriladi.
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
