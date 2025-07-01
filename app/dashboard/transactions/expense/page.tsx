"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Check, Search } from "lucide-react"
import { apiService, type Selling } from "@/lib/api"
import { toast } from "sonner"

export default function ExpensePage() {
  const [sellings, setSellings] = useState<Selling[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [acceptedFilter, setAcceptedFilter] = useState<"all" | "true" | "false">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const fetchSellings = async () => {
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

      if (acceptedFilter !== "all") {
        params.isAccepted = acceptedFilter
      }

      console.log("Fetching sellings with params:", params)

      const response = await apiService.getSellings(params)

      console.log("Sellings response:", response)

      if (response.success.is) {
        setSellings(response.data.data)
        setTotalPages(response.data.pagesCount)
        setTotalCount(response.data.totalCount)
      } else {
        toast.error("Chiqimlarni yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching sellings:", error)
      toast.error("Chiqimlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSellings()
  }, [currentPage, searchTerm, acceptedFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleAcceptedFilter = (value: string) => {
    setAcceptedFilter(value as "all" | "true" | "false")
    setCurrentPage(1)
  }

  const handleApprove = async (sellingId: string) => {
    try {
      console.log("Approving selling:", sellingId)
      const response = await apiService.updateSelling(sellingId, { isAccepted: true })

      console.log("Approve response:", response)

      if (response.success.is) {
        toast.success("Chiqim tasdiqlandi")
        fetchSellings()
      } else {
        toast.error("Chiqimni tasdiqlashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error approving selling:", error)
      toast.error("Chiqimni tasdiqlashda xatolik yuz berdi")
    }
  }

  const handleView = async (sellingId: string) => {
    try {
      const response = await apiService.getSellingById(sellingId)

      if (response.success.is) {
        // Bu yerda batafsil ko'rish modal yoki sahifasini ochish mumkin
        console.log("Selling details:", response.data)
        toast.info("Batafsil ma'lumot konsolda ko'rsatildi")
      } else {
        toast.error("Chiqim ma'lumotlarini yuklashda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Error fetching selling details:", error)
      toast.error("Chiqim ma'lumotlarini yuklashda xatolik yuz berdi")
    }
  }

  const getStatusBadge = (selling: Selling) => {
    console.log("Selling isAccepted value:", selling.isAccepted, typeof selling.isAccepted)

    // Handle different possible values for isAccepted
    if (selling.isAccepted === true || selling.isAccepted === "true") {
      return <Badge>Tasdiqlangan</Badge>
    } else {
      return <Badge variant="secondary">Yangi</Badge>
    }
  }

  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge>Faol</Badge>
      case "pending":
        return <Badge variant="secondary">Kutilmoqda</Badge>
      case "defected":
        return <Badge variant="destructive">Nuqsonli</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const canShowApproveButton = (selling: Selling) => {
    // Faqat tasdiqlangan bo'lmagan chiqimlar uchun tasdiqlash buttonini ko'rsatish
    return selling.isAccepted !== true && selling.isAccepted !== "true"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chiqim</h1>
          <p className="text-muted-foreground">Sotilgan mahsulotlar</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Chiqim</h1>
        <p className="text-muted-foreground">Sotilgan mahsulotlar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chiqimlar ro'yxati</CardTitle>
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
              <Select value={acceptedFilter} onValueChange={handleAcceptedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Holat bo'yicha filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="true">Tasdiqlangan</SelectItem>
                  <SelectItem value="false">Tasdiqlanmagan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">№</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Turi</TableHead>
                  <TableHead>Ombor</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Mahsulot ID</TableHead>
                  <TableHead>Mahsulot holati</TableHead>
                  <TableHead>Chiqim holati</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Chiqimlar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  sellings.map((selling, index) => (
                    <TableRow key={selling.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>{new Date(selling.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                      <TableCell>{getProductStatusBadge(selling.orderProduct.type)}</TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{selling.storehouse.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {selling.storehouse.type === "warehouse" ? "Ombor" : "Showroom"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{selling.orderProduct.quantity}</TableCell>
                      <TableCell className="font-mono">{selling.orderProduct.sps.sp.product.publicId}</TableCell>
                      <TableCell>{getProductStatusBadge(selling.orderProduct.sps.status)}</TableCell>
                      <TableCell>{getStatusBadge(selling)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(selling.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canShowApproveButton(selling) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                              onClick={() => handleApprove(selling.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Jami {totalCount} ta chiqim, {totalPages} sahifa
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
    </div>
  )
}
