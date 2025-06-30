"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, ShoppingCart, Plus, CreditCard, MapPin, Calendar, Loader2, DollarSign } from "lucide-react"
import { useToast } from "../../../../hooks/use-toast"
import { apiService, User } from "@/lib/api"

interface CartItem {
  id: string
  type: "standart" | "nonstandart"
  createdAt: string
  description: string
  price: string
  priceWithSale: string
  sale: number
  quantity: number
  totalSum: string
  seller: {
    id: string
    fullname: string
    phone: string
  }
  sps: {
    status: string
    sp: {
      id: string
      product: {
        id: string
        description: string
        direction: string
        tissue: string
        quantity: number
        publicId: string
        model: {
          id: string
          name: string
          furnitureType: {
            id: string
            name: string
          }
        }
      }
      storehouse: {
        id: string
        name: string
      }
    }
  }
}


enum PaymentMethod {
  cash_with_receipt = "cash_with_receipt",
  cash_without_receipt = "cash_without_receipt",
  card_payme = "card_payme",
  card_uzum = "card_uzum",
  card_anor = "card_anor",
  card_solfy = "card_solfy",
  card_zoodpay = "card_zoodpay",
  card_to_card = "card_to_card",
  transfer = "transfer",
  terminal = "terminal",
}

enum PaymentCurrency {
  uzs = "uzs",
  usd = "usd",
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cash_with_receipt]: "Naqd (chek bilan)",
  [PaymentMethod.cash_without_receipt]: "Naqd (cheksiz)",
  [PaymentMethod.card_payme]: "PayMe karta",
  [PaymentMethod.card_uzum]: "Uzum karta",
  [PaymentMethod.card_anor]: "Anor karta",
  [PaymentMethod.card_solfy]: "Solfy karta",
  [PaymentMethod.card_zoodpay]: "ZoodPay karta",
  [PaymentMethod.card_to_card]: "Kartadan kartaga",
  [PaymentMethod.transfer]: "O'tkazma",
  [PaymentMethod.terminal]: "Terminal",
}

interface Model {
  id: string
  name: string
  furnitureType: {
    id: string
    name: string
  }
}

export default function CartPage() {
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [editForm, setEditForm] = useState({
    quantity: 1,
    description: "",
    price: "0",
    priceWithSale: "0",
    sale: 0,
    totalSum: "0",
    productDetail: {
      direction: "",
      tissue: "",
      modelId: "",
      quantity: 1,
    },
  })

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState<{
      isOpen: boolean
      cartId: string
      productId: string
    }>({
      isOpen: false,
      cartId: "",
      productId: "",
    })
  

    // Order creation modal state
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [isCreatingOrder, setIsCreatingOrder] = useState(false)
    const [clients, setClients] = useState<User[]>([])
    const [isLoadingClients, setIsLoadingClients] = useState(false)
  
    // Order form state
    const [deliveryDate, setDeliveryDate] = useState("")
    const [deliveryAddress, setDeliveryAddress] = useState("")
    const [selectedClientId, setSelectedClientId] = useState("")
  
    // Payment form state
    const [paymentDescription, setPaymentDescription] = useState("")
    const [exchangeRate, setExchangeRate] = useState(1)
    const [fromCurrency, setFromCurrency] = useState<PaymentCurrency>(PaymentCurrency.uzs)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cash_with_receipt)
    const [sum, setSum] = useState(0)
  

  useEffect(() => {
    loadCartItems()
    loadModels()
  }, [])

  const loadCartItems = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMyCartItems({
        pagination: false,
      })

      if (response.success.is && response.data) {
        setCartItems(response.data.data || [])
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Savat ma'lumotlarini yuklashda xatolik",
        })
      }
    } catch (error) {
      console.error("Load cart items error:", error)
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Savat ma'lumotlarini yuklashda xatolik",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      setIsLoadingClients(true)
      const response = await apiService.getUsers({
        pagination: false,
        roleNames: ["client"],
      })

      if (response.success.is && response.data) {
        setClients(response.data.data || [])
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Mijozlarni yuklashda xatolik yuz berdi",
        })
      }
    } catch (error) {
      console.error("Load clients error:", error)
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Mijozlarni yuklashda xatolik yuz berdi",
      })
    } finally {
      setIsLoadingClients(false)
    }
  }


  const loadModels = async () => {
    try {
      const response = await apiService.getModels({
        pagination: false,
      })

      if (response.success.is && response.data) {
        setModels(response.data.data || [])
      }
    } catch (error) {
      console.error("Load models error:", error)
    }
  }

  useEffect(() => {
    if (isOrderModalOpen && clients.length === 0) {
      loadClients()
    }
  }, [isOrderModalOpen])

  // Auto-set exchange rate to 1 when currency is UZS
  useEffect(() => {
    if (fromCurrency === PaymentCurrency.uzs) {
      setExchangeRate(1)
    }
  }, [fromCurrency])

  const handleEdit = (item: CartItem) => {
    setEditingItem(item)
    setEditForm({
      quantity: item.quantity,
      description: item.description,
      price: item.price,
      priceWithSale: item.priceWithSale,
      sale: item.sale,
      totalSum: item.totalSum,
      productDetail: {
        direction: item.sps.sp.product.direction,
        tissue: item.sps.sp.product.tissue,
        modelId: item.sps.sp.product.model.id,
        quantity: item.sps.sp.product.quantity,
      },
    })
    setEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingItem) return

    try {
      const updateData: any = {
        quantity: editForm.quantity,
        description: editForm.description,
        price: editForm.price,
        priceWithSale: editForm.priceWithSale,
        sale: editForm.sale,
        totalSum: editForm.totalSum,
      }

      // Agar nonstandart bo'lsa productDetail ham qo'shamiz
      if (editingItem.type === "nonstandart") {
        updateData.productDetail = {
          direction: editForm.productDetail.direction,
          tissue: editForm.productDetail.tissue,
          modelId: editForm.productDetail.modelId,
          quantity: editForm.productDetail.quantity,
        }
      }

      const response = await apiService.updateCart(editingItem.id, updateData)

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Savat elementi muvaffaqiyatli yangilandi",
        })
        setEditModalOpen(false)
        setEditingItem(null)
        loadCartItems()
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Yangilashda xatolik yuz berdi",
        })
      }
    } catch (error) {
      console.error("Update cart item error:", error)
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Yangilashda xatolik yuz berdi",
      })
    }
  }

  const handleDeleteCart = async () => {
    try {
      const response = await apiService.deleteCart(deleteModal.cartId)
      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Mahsulot savatdan o'chirildi",
        })
        setDeleteModal({ isOpen: false, cartId: "", productId: "" })
        loadCartItems()
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description:"Mahsulotni o'chirishda xatolik yuz berdi",
        })
      }
    } catch (error) {
      console.error("Error deleting cart item:", error)
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
      })
    }
  }
  const handleCreateOrder = async () => {
    // Validation
    if (!deliveryDate || !deliveryAddress || !selectedClientId || sum <= 0) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring",
      })
      return
    }

    try {
      setIsCreatingOrder(true)

      const totalSum = sum * exchangeRate

      const payment = {
        description: paymentDescription,
        exchangeRate: exchangeRate,
        fromCurrency: fromCurrency,
        method: paymentMethod,
        sum: sum,
        totalSum: totalSum,
      }

      const response = await apiService.createOrder({
        deliveryDate: deliveryDate,
        deliveryAddress: deliveryAddress,
        clientId: selectedClientId,
        payments: [payment],
      })

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Buyurtma muvaffaqiyatli yaratildi",
        })

        // Reset form
        setIsOrderModalOpen(false)
        setDeliveryDate("")
        setDeliveryAddress("")
        setSelectedClientId("")
        setPaymentDescription("")
        setExchangeRate(1)
        setFromCurrency(PaymentCurrency.uzs)
        setPaymentMethod(PaymentMethod.cash_with_receipt)
        setSum(0)

        // Reload cart items
        loadCartItems()
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Buyurtma yaratishda xatolik yuz berdi",
        })
      }
    } catch (error) {
      console.error("Create order error:", error)
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Buyurtma yaratishda xatolik yuz berdi",
      })
    } finally {
      setIsCreatingOrder(false)
    }
  }


  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uz-UZ").format(Number(price))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalSum = sum * exchangeRate

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Savat</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Savat</h1>
          <Badge variant="secondary">{cartItems.length} ta mahsulot</Badge>
        </div>
        <Button
          className="flex items-center gap-2"
          disabled={cartItems.length === 0}
          onClick={() => setIsOrderModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Buyurtma yaratish
        </Button>    
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Savat bo'sh</h3>
            <p className="text-muted-foreground">Hozircha savatda hech qanday mahsulot yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {item.sps.sp.product.model.furnitureType.name} - {item.sps.sp.product.model.name}
                    </CardTitle>
                    <CardDescription>
                      ID: {item.sps.sp.product.publicId} • {formatDate(item.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={item.type === "standart" ? "default" : "secondary"}>{item.type}</Badge>
                    <Badge variant={item.sps.status === "defected" ? "destructive" : "default"}>
                      {item.sps.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Miqdor:</span>
                      <span className="font-medium">{item.quantity} ta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Narx:</span>
                      <span className="font-medium">{formatPrice(item.price)} so'm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Chegirma:</span>
                      <span className="font-medium">{item.sale}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Chegirmali narx:</span>
                      <span className="font-medium">{formatPrice(item.priceWithSale)} so'm</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Jami summa:</span>
                      <span className="font-bold text-lg">{formatPrice(item.totalSum)} so'm</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Yo'nalish:</span>
                      <span className="font-medium">{item.sps.sp.product.direction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mato:</span>
                      <span className="font-medium">{item.sps.sp.product.tissue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ombor:</span>
                      <span className="font-medium">{item.sps.sp.storehouse.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sotuvchi:</span>
                      <span className="font-medium">{item.seller.fullname}</span>
                    </div>
                  </div>
                </div>

                {item.description && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{item.description}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Tahrirlash
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        cartId: item.id,
                        productId: item.sps.sp.product.publicId,
                      })
                      }
                    >
                    <Trash2 className="h-4 w-4 mr-2" />
                    O'chirish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Savat elementini tahrirlash</DialogTitle>
            <DialogDescription>
              {editingItem?.type === "standart"
                ? "Standart mahsulot ma'lumotlarini tahrirlang"
                : "Nostandart mahsulot ma'lumotlarini tahrirlang"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Miqdor</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      totalSum: String(Number(e.target.value || 1) * Number(prev.priceWithSale)), 
                      quantity: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale">Chegirma (%)</Label>
                <Input
                  id="sale"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.sale}
                  disabled={true}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sale: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Narx</Label>
                <Input
                  id="price"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sale: (((Number(e.target.value) - Number(prev.priceWithSale))/Number(e.target.value))*100) || 0,
                      price: e.target.value || '0',
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceWithSale">Chegirmali narx</Label>
                <Input
                  id="priceWithSale"
                  value={editForm.priceWithSale}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      sale: (((Number(prev.price) - Number(e.target.value)) / Number(prev.price)) * 100) || 0,
                      totalSum: String(Number(prev.quantity || 1) * Number(e.target.value)), 
                      priceWithSale: e.target.value || '0',
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSum">Jami summa</Label>
              <Input
                id="totalSum"
                disabled={true}
                value={editForm.totalSum}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    totalSum: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Izoh</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Nostandart tur uchun qo'shimcha maydonlar */}
            {editingItem?.type === "nonstandart" && (
              <>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Mahsulot tafsilotlari</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="direction">Yo'nalish</Label>
                      <Select
                        value={editForm.productDetail.direction}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({
                            ...prev,
                            productDetail: {
                              ...prev.productDetail,
                              direction: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Yo'nalishni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Chap</SelectItem>
                          <SelectItem value="right">O'ng</SelectItem>
                          <SelectItem value="center">Markaziy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tissue">Mato</Label>
                      <Input
                        id="tissue"
                        value={editForm.productDetail.tissue}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            productDetail: {
                              ...prev.productDetail,
                              tissue: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="modelId">Model</Label>
                      <Select
                        value={editForm.productDetail.modelId}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({
                            ...prev,
                            productDetail: {
                              ...prev.productDetail,
                              modelId: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Modelni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.furnitureType.name} - {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productQuantity">Mahsulot miqdori</Label>
                      <Input
                        id="productQuantity"
                        type="number"
                        min="1"
                        value={editForm.productDetail.quantity}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            productDetail: {
                              ...prev.productDetail,
                              quantity: Number.parseInt(e.target.value) || 1,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpdate}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Order Creation Modal */}
       <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Buyurtma yaratish
            </DialogTitle>
            <DialogDescription>Savatdagi mahsulotlar uchun buyurtma yarating</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Yetkazib berish ma'lumotlari</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">
                    Yetkazib berish vaqti <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="datetime-local"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">
                    Yetkazib berish manzili <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="To'liq manzilni kiriting..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Mijoz tanlash</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">
                  Mijoz <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mijozni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Yuklanmoqda...</span>
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">Mijozlar topilmadi</div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{client.fullname}</span>
                            <span className="text-xs text-muted-foreground">{client.phone}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h3 className="text-lg font-semibold">To'lov ma'lumotlari</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    To'lov usuli <span className="text-red-500">*</span>
                  </Label>
                  <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="To'lov usulini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromCurrency">
                    Valyuta <span className="text-red-500">*</span>
                  </Label>
                  <Select value={fromCurrency} onValueChange={(value: PaymentCurrency) => setFromCurrency(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Valyutani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentCurrency.uzs}>UZS</SelectItem>
                      <SelectItem value={PaymentCurrency.usd}>USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">
                    Ayirboshlash kursi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number.parseFloat(e.target.value) || 1)}
                    disabled={fromCurrency === PaymentCurrency.uzs}
                    placeholder="Kursni kiriting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sum">
                    Summa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sum"
                    type="number"
                    min="0"
                    step="0.01"
                    value={sum || ""}
                    onChange={(e) => setSum(Number.parseFloat(e.target.value) || 0)}
                    placeholder="Summani kiriting"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="paymentDescription">To'lov tavsifi</Label>
                  <Input
                    id="paymentDescription"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder="Qo'shimcha ma'lumotlar..."
                  />
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Jami to'lov summasi:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg font-bold text-green-600">
                      {totalSum.toLocaleString()} {fromCurrency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOrderModalOpen(false)}
                disabled={isCreatingOrder}
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !deliveryDate || !deliveryAddress || !selectedClientId || sum <= 0}
              >
                {isCreatingOrder ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Buyurtma yaratish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ ...deleteModal, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahsulotni savatdan o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham <strong>{deleteModal.productId}</strong> mahsulotini savatdan o'chirmoqchimisiz? Bu amalni
              bekor qilib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCart}
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
