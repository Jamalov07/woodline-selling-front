"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Check, X, Search, Plus } from 'lucide-react'
import { apiService, type Purchase } from "@/lib/api"
import { toast } from "sonner"
import { AddPurchaseDialog } from "@/components/add-purchase-dialog"

export default function IncomePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "accepted" | "cancelled">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const pageSize = 10

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const params: any = {
        pageNumber: currentPage,
        pageSize,
        pagination: true,
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await apiService.getPurchases(params)

      if (response.success.is) {
        setPurchases(response.data.data)
        setTotalPages(response.data.pagesCount)
        setTotalCount(response.data.totalCount)
      } else {
        toast.error("Kirimlarni yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast.error("Kirimlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [currentPage, searchTerm, statusFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as "all" | "new" | "accepted" | "cancelled")
    setCurrentPage(1)
  }

  const handleApprove = async (purchaseId: string) => {
    try {
      const response = await apiService.updatePurchase(purchaseId, { status: "accepted" })

      if (response.success.is) {
        toast.success("Kirim tasdiqlandi")
        fetchPurchases()
      } else {
        toast.error("Kirimni tasdiqlashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error approving purchase:", error)
      toast.error("Kirimni tasdiqlashda xatolik yuz berdi")
    }
  }

  const handleCancel = async (purchaseId: string) => {
    try {
      const response = await apiService.updatePurchase(purchaseId, { status: "cancelled" })

      if (response.success.is) {
        toast.success("Kirim bekor qilindi")
        fetchPurchases()
      } else {
        toast.error("Kirimni bekor qilishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error cancelling purchase:", error)
      toast.error("Kirimni bekor qilishda xatolik yuz berdi")
    }
  }

  const handleView = async (purchaseId: string) => {
    try {
      const response = await apiService.getPurchaseById(purchaseId)

      if (response.success.is) {
        // Bu yerda batafsil ko'rish modal yoki sahifasini ochish mumkin
        console.log("Purchase details:", response.data)
        toast.info("Batafsil ma'lumot konsolda ko'rsatildi")
      } else {
        toast.error("Kirim ma'lumotlarini yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error)
      toast.error("Kirim ma'lumotlarini yuklashda xatolik yuz berdi")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Yangi</Badge>
      case "accepted":
        return <Badge>Tasdiqlangan</Badge>
      case "cancelled":
        return <Badge variant="destructive">Bekor qilingan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const canShowActionButtons = (purchase: Purchase) => {
    return purchase.status === "new"
  }

  const calculateProductInfo = (purchase: Purchase) => {
    const varietyCount = purchase.productMVs.length
    const totalQuantity = purchase.productMVs.reduce((total, productMV) => {
      const productQuantity = productMV.statuses.reduce((sum, status) => sum + status.quantity, 0)
      return total + productQuantity
    }, 0)

    return { varietyCount, totalQuantity }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kirim</h1>
          <p className="text-muted-foreground">Ta'minotchilardan kelgan mahsulotlar</p>
        </div>
        <div className="rounded-lg border p-8 text-center">
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kirim</h1>
        <p className="text-muted-foreground">Ta'minotchilardan kelgan mahsulotlar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kirimlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status bo'yicha filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha statuslar</SelectItem>
                  <SelectItem value="new">Yangi</SelectItem>
                  <SelectItem value="accepted">Tasdiqlangan</SelectItem>
                  <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yangi kirim qo'shish
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">№</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Ta'minotchi</TableHead>
                  <TableHead>Ombor</TableHead>
                  <TableHead>Omborchi</TableHead>
                  <TableHead>Mahsulotlar</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Kirimlar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase, index) => {
                    const { varietyCount, totalQuantity } = calculateProductInfo(purchase)

                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                        <TableCell>{new Date(purchase.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{purchase.provider.fullname}</div>
                            <div className="text-sm text-muted-foreground">{purchase.provider.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{purchase.storehouse.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {purchase.storehouse.type === "warehouse" ? "Ombor" : "Showroom"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {purchase.storekeeper ? (
                            <div className="space-y-1">
                              <div className="font-medium">{purchase.storekeeper.fullname}</div>
                              <div className="text-sm text-muted-foreground">{purchase.storekeeper.phone}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{varietyCount} xil</div>
                            <div className="text-sm text-muted-foreground">{totalQuantity} dona</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleView(purchase.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canShowActionButtons(purchase) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                                  onClick={() => handleApprove(purchase.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                                  onClick={() => handleCancel(purchase.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Jami {totalCount} ta kirim, {totalPages} sahifa
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Oldingi
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPurchaseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchPurchases}
      />
    </div>
  )
}
