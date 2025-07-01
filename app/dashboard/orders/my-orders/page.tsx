"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/hooks/use-toast"
import { apiService, type Order, type OrderListResponse } from "@/lib/api"
import { Loader2, ShoppingBag, Eye, Calendar, MapPin, Phone, User } from "lucide-react"
import Link from "next/link"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const pageSize = 10

  const loadOrders = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await apiService.getMyOrders({
        pagination: true,
        pageNumber: page,
        pageSize,
      })

      if (response.success.is && response.data) {
        const orderData = response.data as OrderListResponse
        setOrders(orderData.data || [])
        setTotalCount(orderData.totalCount || 0)
        setTotalPages(orderData.pagesCount || 1)
      } else {
        toast({
          title: "Xatolik",
          description: "Buyurtmalarni yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Load orders error:", error)
      toast({
        title: "Xatolik",
        description: "Buyurtmalarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(currentPage)
  }, [currentPage])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">Yangi</Badge>
      case "processing":
        return <Badge variant="default">Jarayonda</Badge>
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Tugallangan
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Bekor qilingan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateTotalPayments = (payments: any[]) => {
    return payments.reduce((sum, payment) => sum + Number(payment.totalSum), 0)
  }

  const calculateTotalProducts = (products: any[]) => {
    return products.reduce((sum, product) => sum + Number(product.totalSum), 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mening buyurtmalarim</h1>
          <p className="text-muted-foreground">Jami {totalCount} ta buyurtma</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Buyurtmalar yo'q</h3>
            <p className="text-muted-foreground text-center">Hozircha hech qanday buyurtma yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Buyurtmalar ro'yxati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-with-borders">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">№</TableHead>
                      <TableHead>Yaratilgan vaqt</TableHead>
                      <TableHead>Mijoz</TableHead>
                      <TableHead>Yetkazish vaqti</TableHead>
                      <TableHead>Yetkazish manzili</TableHead>
                      <TableHead>To'lov summasi</TableHead>
                      <TableHead>Mahsulot summasi</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => {
                      const rowNumber = (currentPage - 1) * pageSize + index + 1
                      const totalPayments = calculateTotalPayments(order.payments)
                      const totalProducts = calculateTotalProducts(order.products)

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{rowNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(order.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{order.client.fullname}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{order.client.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(order.deliveryDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="max-w-[200px] truncate text-sm" title={order.deliveryAddress}>
                                {order.deliveryAddress}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{totalPayments.toLocaleString()} so'm</div>
                              <div className="text-xs text-muted-foreground">{order.payments.length} ta to'lov</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">{totalProducts.toLocaleString()} so'm</div>
                              <div className="text-xs text-muted-foreground">{order.products.length} ta mahsulot</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/orders/my-orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1)
                        }
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNumber <= totalPages) {
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
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1)
                        }
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
        </>
      )}
    </div>
  )
}
