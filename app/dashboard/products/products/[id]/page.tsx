"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiService, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Package, Layers, Navigation, FileText, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductDetails extends Product {
  publicId: string
  tissue: string
  quantity: number
  direction: "left" | "right" | "none"
  description: string
  type: "standart" | "nonstandart"
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getProduct(id)
      if (response.success.is) {
        setProduct(response.data as ProductDetails)
      } else {
        setError("Mahsulot topilmadi")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Mahsulotni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Mahsulot ma'lumotlari</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Orqaga qaytish
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Mahsulot ma'lumotlari</h1>
          <p className="text-muted-foreground">ID: {product.publicId}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asosiy ma'lumotlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Asosiy ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Turi:</span>
              <Badge variant={product.type === "standart" ? "default" : "secondary"}>{getTypeText(product.type)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Umumiy ID:</span>
              <span className="font-mono text-sm">{product.publicId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">To'qima:</span>
              <span>{product.tissue}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Miqdor:</span>
              <Badge variant="outline">{product.quantity} dona</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Yo'nalish:</span>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span>{getDirectionText(product.direction)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model va ta'minotchi ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Model ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Model nomi:</span>
              <span className="font-medium">{product.model.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Mebel turi:</span>
              <Badge variant="secondary">{product.model.furnitureType.name}</Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Ta'minotchi ma'lumotlari
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">{product.model.provider.fullname}</p>
                <p className="text-sm text-muted-foreground">{product.model.provider.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tavsif */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tavsif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{product.description || "Tavsif kiritilmagan"}</p>
          </CardContent>
        </Card>

        {/* Vaqt ma'lumotlari */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vaqt ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yaratilgan:</p>
                <p className="text-sm">{new Date(product.createdAt).toLocaleString("uz-UZ")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yangilangan:</p>
                <p className="text-sm">{new Date(product.updatedAt).toLocaleString("uz-UZ")}</p>
              </div>
              {product.deletedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">O'chirilgan:</p>
                  <p className="text-sm">{new Date(product.deletedAt).toLocaleString("uz-UZ")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => router.push(`/dashboard/products/products?edit=${product.id}`)}>Tahrirlash</Button>
        <Button variant="outline" onClick={() => router.back()}>
          Orqaga qaytish
        </Button>
      </div>
    </div>
  )
}
