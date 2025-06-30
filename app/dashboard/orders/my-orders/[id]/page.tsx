"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hozircha loading holatini ko'rsatamiz
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders/my-orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Buyurtma tafsilotlari</h1>
          <p className="text-muted-foreground">Buyurtma ID: {orderId}</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Buyurtma tafsilotlari</h3>
          <p className="text-muted-foreground text-center">
            Bu sahifa hozircha ishlab chiqilmoqda. Keyinchalik buyurtma haqida batafsil ma'lumotlar ko'rsatiladi.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
