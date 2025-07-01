"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Eye, Edit } from "lucide-react"
import { apiService, type OrderProduct } from "@/lib/api"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const statusLabels = {
  new: "Yangi",
  accepted: "Qabul qilingan",
  cancelled: "Bekor qilingan",
  sold: "Tayyor",
  loaded: "Yuklangan",
  received: "Qabul qilingan",
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  sold: "bg-purple-100 text-purple-800",
  loaded: "bg-orange-100 text-orange-800",
  received: "bg-gray-100 text-gray-800",
}

const typeLabels = {
  standart: "Standart",
  nonstandart: "Nostandart",
}

export default function OrderProductsPage() {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedOrderProduct, setSelectedOrderProduct] = useState<OrderProduct | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("")

  const pageSize = 10

  useEffect(() => {
    loadOrderProducts()
  }, [currentPage, searchTerm, statusFilter])

  const loadOrderProducts = async () => {
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

      console.log("Loading order products with params:", params)

      const response = await apiService.getOrderProducts(params)
      console.log("Order products response:", response)

      if (response.success.is && response.data) {
        setOrderProducts(response.data.data || [])
        setTotalPages(response.data.pagesCount || 1)
        setTotalCount(response.data.totalCount || 0)
      } else {
        console.error("Failed to load order products:", response.error)
        toast.error("Buyurtma mahsulotlarini yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Load order products error:", error)
      toast.error("Buyurtma mahsulotlarini yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    loadOrderProducts()
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    loadOrderProducts()
  }

  const handleViewDetails = (orderProduct: OrderProduct) => {
    setSelectedOrderProduct(orderProduct)
    setViewDialogOpen(true)
  }

  const handleUpdateStatus = (orderProduct: OrderProduct) => {
    setSelectedOrderProduct(orderProduct)
    setSelectedNewStatus("")
    setUpdateDialogOpen(true)
  }

  const updateOrderProductStatus = async () => {
    if (!selectedOrderProduct || !selectedNewStatus) return

    try {
      setUpdating(true)
      console.log("Updating order product status:", selectedOrderProduct.id, "to", selectedNewStatus)

      const response = await apiService.updateOrderProduct(selectedOrderProduct.id, {
        status: selectedNewStatus as "accepted" | "cancelled" | "sold" | "loaded" | "received",
      })

      console.log("Update response:", response)

      if (response.success.is) {
        toast.success("Status muvaffaqiyatli yangilandi")
        setUpdateDialogOpen(false)
        setSelectedNewStatus("")
        loadOrderProducts()
      } else {
        console.error("Failed to update status:", response.error)
        toast.error("Statusni yangilashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Update status error:", error)
      toast.error("Statusni yangilashda xatolik yuz berdi")
    } finally {
      setUpdating(false)
    }
  }

  const getAvailableStatuses = (currentStatus: string) => {
    if (currentStatus === "new") {
      return ["accepted", "cancelled"]
    } else if (currentStatus === 'accepted') {
      return ["sold"]
    }
    return []
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("uz-UZ").format(Number(price))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Buyurtma mahsulotlari</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyurtma mahsulotlari ro'yxati</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status bo'yicha filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha statuslar</SelectItem>
                <SelectItem value="new">Yangi</SelectItem>
                <SelectItem value="accepted">Qabul qilingan</SelectItem>
                <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                <SelectItem value="sold">Tayyor</SelectItem>
                <SelectItem value="loaded">Yuklangan</SelectItem>
                <SelectItem value="received">Qabul qilingan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">№</TableHead>
                    <TableHead>Turi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Jami summa</TableHead>
                    <TableHead>Sotuvchi</TableHead>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead>Ombor</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Buyurtma mahsulotlari topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderProducts.map((orderProduct, index) => (
                      <TableRow key={orderProduct.id}>
                        <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[orderProduct.type] || orderProduct.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[orderProduct.status] || "bg-gray-100 text-gray-800"}>
                            {statusLabels[orderProduct.status] || orderProduct.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(orderProduct.createdAt)}</TableCell>
                        <TableCell>{formatPrice(orderProduct.totalSum)} so'm</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{orderProduct.seller.fullname}</div>
                            <div className="text-sm text-gray-500">{orderProduct.seller.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{orderProduct.sps.sp.product.publicId}</div>
                            <div className="text-sm text-gray-500">{orderProduct.sps.sp.product.model.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{orderProduct.sps.sp.storehouse.name}</div>
                            <div className="text-sm text-gray-500">
                              {orderProduct.sps.sp.storehouse.type === "warehouse" ? "Ombor" : "Showroom"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(orderProduct)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {getAvailableStatuses(orderProduct.status).length > 0 && (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(orderProduct)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">Jami: {totalCount} ta buyurtma mahsuloti</div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = i + 1
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(pageNumber)
                              }}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      {totalPages > 5 && <PaginationEllipsis />}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buyurtma mahsuloti tafsilotlari</DialogTitle>
          </DialogHeader>
          {selectedOrderProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm">{selectedOrderProduct.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Turi</label>
                  <p className="text-sm">{typeLabels[selectedOrderProduct.type]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={statusColors[selectedOrderProduct.status]}>
                    {statusLabels[selectedOrderProduct.status]}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Yaratilgan sana</label>
                  <p className="text-sm">{formatDate(selectedOrderProduct.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Narx</label>
                  <p className="text-sm">{formatPrice(selectedOrderProduct.price)} so'm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chegirma bilan narx</label>
                  <p className="text-sm">{formatPrice(selectedOrderProduct.priceWithSale)} so'm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Miqdor</label>
                  <p className="text-sm">{selectedOrderProduct.quantity} ta</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Jami summa</label>
                  <p className="text-sm font-medium">{formatPrice(selectedOrderProduct.totalSum)} so'm</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tavsif</label>
                <p className="text-sm">{selectedOrderProduct.description || "Tavsif yo'q"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Sotuvchi</label>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedOrderProduct.seller.fullname}</p>
                  <p className="text-sm text-gray-600">{selectedOrderProduct.seller.phone}</p>
                  <p className="text-sm text-gray-600">
                    Balans: {formatPrice(selectedOrderProduct.seller.balance)} so'm
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Mahsulot</label>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedOrderProduct.sps.sp.product.publicId}</p>
                  <p className="text-sm text-gray-600">Model: {selectedOrderProduct.sps.sp.product.model.name}</p>
                  <p className="text-sm text-gray-600">Mato: {selectedOrderProduct.sps.sp.product.tissue}</p>
                  <p className="text-sm text-gray-600">Yo'nalish: {selectedOrderProduct.sps.sp.product.direction}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Ombor</label>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedOrderProduct.sps.sp.storehouse.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrderProduct.sps.sp.storehouse.type === "warehouse" ? "Ombor" : "Showroom"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statusni yangilash</DialogTitle>
          </DialogHeader>
          {selectedOrderProduct && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Hozirgi status</label>
                <div className="mt-1">
                  <Badge className={statusColors[selectedOrderProduct.status]}>
                    {statusLabels[selectedOrderProduct.status]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Yangi statusni tanlang</label>
                <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statusni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses(selectedOrderProduct.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          <Badge className={statusColors[status as keyof typeof statusColors]}>
                            {statusLabels[status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={updating}>
              Bekor qilish
            </Button>
            <Button onClick={updateOrderProductStatus} disabled={updating || !selectedNewStatus}>
              {updating ? "Yangilanmoqda..." : "Tasdiqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
