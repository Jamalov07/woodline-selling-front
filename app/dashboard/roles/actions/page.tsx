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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { apiService, type Action } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dialog states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  const fetchActions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getActions({
        pageNumber: currentPage,
        pageSize,
        name: searchTerm || undefined,
        pagination: true,
      })

      if (response.success.is) {
        setActions(response.data.data)
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
    fetchActions()
  }, [currentPage, pageSize, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleUpdate = async () => {
    if (!selectedAction) return

    try {
      setIsSubmitting(true)
      const response = await apiService.updateAction(selectedAction.id, {
        description: formData.description.trim(),
      })

      if (response.success.is) {
        toast({
          variant: "success",
          title: "Muvaffaqiyat",
          description: "Amal tavsifi muvaffaqiyatli yangilandi",
        })
        setIsUpdateDialogOpen(false)
        setSelectedAction(null)
        setFormData({ description: "" })
        fetchActions()
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
        description: "Amal tavsifini yangilashda xatolik yuz berdi",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUpdateDialog = (action: Action) => {
    setSelectedAction(action)
    setFormData({ description: action.description || "" })
    setIsUpdateDialogOpen(true)
  }

  const handleViewDetails = (action: Action) => {
    router.push(`/dashboard/roles/actions/${action.id}`)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Amallar</h1>
        <p className="text-muted-foreground">Tizim amallari va ruxsatlarini boshqaring</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amallar ro'yxati</CardTitle>
          <CardDescription>Jami {totalCount} ta amal mavjud</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Amalni qidiring..."
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
                  <TableHead>URL</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Tavsif</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Amallar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.map((action, index) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
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
                      <TableCell className="max-w-[200px] truncate">{action.description || "-"}</TableCell>
                      <TableCell>{formatDateTime(action.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(action)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openUpdateDialog(action)}>
                            <Edit className="h-4 w-4" />
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

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amal tavsifini tahrirlash</DialogTitle>
            <DialogDescription>Amal tavsifini yangilang.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amal ma'lumotlari</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodBadgeColor(
                      selectedAction?.method || "",
                    )}`}
                  >
                    {selectedAction?.method.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm">{selectedAction?.url}</span>
                </div>
                <div className="font-medium">{selectedAction?.name}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Amal tavsifini kiriting..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false)
                setSelectedAction(null)
                setFormData({ description: "" })
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
    </div>
  )
}
