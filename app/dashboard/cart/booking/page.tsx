"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { apiService, type StorehouseProductStatus } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { Loader2, Calendar, Package, Hash, ShoppingCart, Trash2 } from "lucide-react"

interface MyBooking {
  id: string
  createdAt: string
  quantity: number
  seller: {
    id: string
    phone: string
    fullname: string
  }
  sps: {
    id: string
    sp: {
      storehouse: {
        id: string
        name: string
        type: string
      }
      product: {
        id: string
        publicId: string
      }
    }
  }
}

export default function BookingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("booked") // Default tab o'zgartirildi
  const [availableProducts, setAvailableProducts] = useState<StorehouseProductStatus[]>([])
  const [myBookings, setMyBookings] = useState<MyBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Available products pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // My bookings pagination
  const [bookingsCurrentPage, setBookingsCurrentPage] = useState(1)
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1)
  const [bookingsTotalCount, setBookingsTotalCount] = useState(0)

  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    spsId: string
    maxQuantity: number
    isUpdate: boolean
    currentQuantity?: number
    bookingId?: string
  }>({
    isOpen: false,
    spsId: "",
    maxQuantity: 0,
    isUpdate: false,
  })
  const [bookingQuantity, setBookingQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    bookingId: string
    productId: string
  }>({
    isOpen: false,
    bookingId: "",
    productId: "",
  })

  const pageSize = 10

  const fetchAvailableProducts = async (page = 1) => {
    setLoading(true)
    try {
      const response = await apiService.getStorehouseProductStatuses({
        pageNumber: page,
        pageSize,
        pagination: true,
      })

      if (response.success.is) {
        setAvailableProducts(response.data.data)
        setTotalPages(response.data.pagesCount)
        setTotalCount(response.data.totalCount)
      } else {
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching available products:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBookings = async (page = 1) => {
    setBookingsLoading(true)
    try {
      const response = await apiService.getMyBookings({
        pageNumber: page,
        pageSize,
        pagination: true,
      })

      if (response.success.is) {
        setMyBookings(response.data.data || [])
        setBookingsTotalPages(response.data.pagesCount || 1)
        setBookingsTotalCount(response.data.totalCount || 0)
      } else {
        toast.error("Bookinglarni yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching my bookings:", error)
      toast.error("Bookinglarni yuklashda xatolik yuz berdi")
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "available") {
      fetchAvailableProducts(currentPage)
    } else if (activeTab === "booked") {
      fetchMyBookings(bookingsCurrentPage)
    }
  }, [activeTab, currentPage, bookingsCurrentPage])

  const calculateQuantities = (sps: StorehouseProductStatus) => {
    const totalQuantity = sps.quantity

    // Carts dan quantity yig'indisi
    const cartsQuantity = sps.carts.reduce((sum, cart) => sum + cart.quantity, 0)

    // Bookings dan quantity yig'indisi
    const bookingsQuantity = sps.bookings.reduce((sum, booking) => sum + booking.quantity, 0)

    // OrderProducts dan quantity yig'indisi (agar mavjud bo'lsa)
    const orderProductsQuantity = sps.orderProducts?.reduce((sum, orderProduct) => sum + orderProduct.quantity, 0) || 0

    // Qolgan miqdor
    const availableQuantity = totalQuantity - (cartsQuantity + bookingsQuantity + orderProductsQuantity)

    return {
      total: totalQuantity,
      carts: cartsQuantity,
      bookings: bookingsQuantity,
      orderProducts: orderProductsQuantity,
      available: Math.max(0, availableQuantity),
    }
  }

  const getUserBooking = (sps: StorehouseProductStatus) => {
    if (!user) return null
    return sps.bookings.find((booking) => booking.seller.id === user.id)
  }

  const handleBooking = (sps: StorehouseProductStatus) => {
    const quantities = calculateQuantities(sps)
    const userBooking = getUserBooking(sps)

    setBookingModal({
      isOpen: true,
      spsId: sps.id,
      maxQuantity: quantities.available + (userBooking?.quantity || 0),
      isUpdate: !!userBooking,
      currentQuantity: userBooking?.quantity,
      bookingId: userBooking?.id,
    })

    setBookingQuantity(userBooking?.quantity || 1)
  }

  const handleSubmitBooking = async () => {
    if (bookingQuantity < 1) {
      toast.error("Miqdor kamida 1 bo'lishi kerak")
      return
    }

    if (bookingQuantity > bookingModal.maxQuantity) {
      toast.error(`Maksimal miqdor: ${bookingModal.maxQuantity}`)
      return
    }

    setSubmitting(true)
    try {
      let response

      if (bookingModal.isUpdate && bookingModal.bookingId) {
        response = await apiService.updateBooking(bookingModal.bookingId, {
          quantity: bookingQuantity,
        })
      } else {
        response = await apiService.createBooking({
          spsId: bookingModal.spsId,
          quantity: bookingQuantity,
        })
      }

      if (response.success.is) {
        toast.success(bookingModal.isUpdate ? "Booking yangilandi" : "Booking yaratildi")
        setBookingModal({ ...bookingModal, isOpen: false })
        fetchAvailableProducts(currentPage)
        if (activeTab === "booked") {
          fetchMyBookings(bookingsCurrentPage)
        }
      } else {
        toast.error(response.error.messages[0] || "Xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast.error("Xatolik yuz berdi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBooking = async () => {
    try {
      const response = await apiService.deleteBooking(deleteModal.bookingId)
      if (response.success.is) {
        toast.success("Booking o'chirildi")
        setDeleteModal({ isOpen: false, bookingId: "", productId: "" })
        fetchMyBookings(bookingsCurrentPage)
      } else {
        toast.error("Bookingni o'chirishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Bookingni o'chirishda xatolik yuz berdi")
    }
  }

  const handleAddToCart = async (booking: MyBooking) => {
    try {
      // Avval savatga qo'shamiz
      const cartResponse = await apiService.createCart({
        spsId: booking.sps.id,
        quantity: booking.quantity,
        description: "",
        sale: 0,
        priceWithSale: 0,
        price: 0,
        totalSum: 0,
      })

      if (cartResponse.success.is) {
        // Savatga qo'shildi, endi bookingni o'chiramiz
        const deleteResponse = await apiService.deleteBooking(booking.id)

        if (deleteResponse.success.is) {
          toast.success("Mahsulot savatga joylashtirildi")
          fetchMyBookings(bookingsCurrentPage)
        } else {
          toast.error("Bookingni o'chirishda xatolik yuz berdi")
        }
      } else {
        toast.error("Savatga joylashtirish muvaffaqiyatsiz")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Savatga joylashtirish muvaffaqiyatsiz")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Kutilmoqda", variant: "secondary" as const },
      active: { label: "Faol", variant: "default" as const },
      defected: { label: "Nuqsonli", variant: "destructive" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking</h1>
        <p className="text-muted-foreground">Mahsulotlarni bron qilish va boshqarish</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="booked">Book qilingan mahsulotlar</TabsTrigger>
          <TabsTrigger value="available">Omborda bor mahsulotlar</TabsTrigger>
        </TabsList>

        <TabsContent value="booked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Book qilingan mahsulotlar
                {bookingsTotalCount > 0 && <Badge variant="secondary">{bookingsTotalCount} ta booking</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Yuklanmoqda...</span>
                </div>
              ) : myBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Hozircha book qilingan mahsulotlar yo'q</p>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">№</TableHead>
                          <TableHead>Miqdor</TableHead>
                          <TableHead>Sana</TableHead>
                          <TableHead>Ombor</TableHead>
                          <TableHead>Mahsulot ID</TableHead>
                          <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myBookings.map((booking, index) => {
                          const rowNumber = (bookingsCurrentPage - 1) * pageSize + index + 1
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{rowNumber}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{booking.quantity} ta</Badge>
                              </TableCell>
                              <TableCell>{formatDate(booking.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  {booking.sps.sp.storehouse.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="bg-muted px-2 py-1 rounded text-sm">
                                  {booking.sps.sp.product.publicId}
                                </code>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddToCart(booking)}
                                    className="flex items-center gap-2"
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                    Savatga joylash
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteModal({
                                        isOpen: true,
                                        bookingId: booking.id,
                                        productId: booking.sps.sp.product.publicId,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {bookingsTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (bookingsCurrentPage > 1) {
                                  setBookingsCurrentPage(bookingsCurrentPage - 1)
                                }
                              }}
                              className={bookingsCurrentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: Math.min(5, bookingsTotalPages) }, (_, i) => {
                            const pageNumber =
                              Math.max(1, Math.min(bookingsTotalPages - 4, bookingsCurrentPage - 2)) + i
                            if (pageNumber <= bookingsTotalPages) {
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setBookingsCurrentPage(pageNumber)
                                    }}
                                    isActive={bookingsCurrentPage === pageNumber}
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
                                if (bookingsCurrentPage < bookingsTotalPages) {
                                  setBookingsCurrentPage(bookingsCurrentPage + 1)
                                }
                              }}
                              className={
                                bookingsCurrentPage >= bookingsTotalPages ? "pointer-events-none opacity-50" : ""
                              }
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
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Omborda mavjud mahsulotlar
                {totalCount > 0 && <Badge variant="secondary">{totalCount} ta mahsulot</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Yuklanmoqda...</span>
                </div>
              ) : availableProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Hozircha mahsulotlar mavjud emas</p>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">№</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Sana
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Mahsulot ID
                            </div>
                          </TableHead>
                          <TableHead>Miqdor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mahsulot</TableHead>
                          <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableProducts.map((sps, index) => {
                          const quantities = calculateQuantities(sps)
                          const userBooking = getUserBooking(sps)
                          const rowNumber = (currentPage - 1) * pageSize + index + 1

                          return (
                            <TableRow key={sps.id}>
                              <TableCell className="font-medium">{rowNumber}</TableCell>
                              <TableCell>{formatDate(sps.createdAt)}</TableCell>
                              <TableCell>
                                <code className="bg-muted px-2 py-1 rounded text-sm">{sps.sp.product.publicId}</code>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <span className="font-medium">Jami: {quantities.total}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Savat: {quantities.carts} | Booking: {quantities.bookings} | Sotilgan:{" "}
                                    {quantities.orderProducts}
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-green-600 font-medium">Mavjud: {quantities.available}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(sps.status)}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{sps.sp.product.model.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {sps.sp.product.model.furnitureType.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {sps.sp.product.tissue} | {sps.sp.product.direction}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  {userBooking && (
                                    <Button variant="outline" size="sm" onClick={() => handleBooking(sps)}>
                                      O'zgartirish ({userBooking.quantity})
                                    </Button>
                                  )}
                                  {quantities.available > 0 && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleBooking(sps)}
                                      disabled={quantities.available === 0}
                                    >
                                      {userBooking ? "Qo'shimcha" : "Book qilish"}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
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
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      <Dialog open={bookingModal.isOpen} onOpenChange={(open) => setBookingModal({ ...bookingModal, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingModal.isUpdate ? "Booking miqdorini o'zgartirish" : "Mahsulotni book qilish"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Miqdor</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={bookingModal.maxQuantity}
                value={bookingQuantity}
                onChange={(e) => setBookingQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">Maksimal miqdor: {bookingModal.maxQuantity}</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBookingModal({ ...bookingModal, isOpen: false })}
                disabled={submitting}
              >
                Bekor qilish
              </Button>
              <Button onClick={handleSubmitBooking} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {bookingModal.isUpdate ? "O'zgartirish" : "Book qilish"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ ...deleteModal, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bookingni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham <strong>{deleteModal.productId}</strong> mahsulotining bookingini o'chirmoqchimisiz? Bu
              amalni bekor qilib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
