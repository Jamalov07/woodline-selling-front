"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { Loader2, Package, Plus, RotateCcw, Calculator } from "lucide-react"

interface FurnitureType {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface Model {
  id: string
  name: string
  furnitureType: {
    id: string
    name: string
  }
  provider: {
    id: string
    fullname: string
  }
}

interface FormData {
  productDetail: {
    publicId: string
    direction: "left" | "right" | "none"
    modelId: string
    tissue: string
    quantity: number
  }
  quantity: number
  description: string
  sale: number
  priceWithSale: number
  price: number
  totalSum: number
}

const initialFormData: FormData = {
  productDetail: {
    publicId: "",
    direction: "none",
    modelId: "",
    tissue: "",
    quantity: 1,
  },
  quantity: 1,
  description: "",
  sale: 0,
  priceWithSale: 0,
  price: 0,
  totalSum: 0,
}

export default function NewOrderPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedFurnitureTypeId, setSelectedFurnitureTypeId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [isLoadingFurnitureTypes, setIsLoadingFurnitureTypes] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [furnitureTypeSearch, setFurnitureTypeSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")

  // Generate public ID on component mount
  useEffect(() => {
    generatePublicId()
    loadFurnitureTypes()
  }, [])

  // Load furniture types when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFurnitureTypes()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [furnitureTypeSearch])

  // Load models when furniture type or search changes
  useEffect(() => {
    if (selectedFurnitureTypeId) {
      const timeoutId = setTimeout(() => {
        loadModels()
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setModels([])
    }
  }, [selectedFurnitureTypeId, modelSearch])

  // Calculate sale percentage when price or priceWithSale changes
  useEffect(() => {
    if (formData.price > 0 && formData.priceWithSale > 0) {
      const salePercentage = ((formData.price - formData.priceWithSale) / formData.price) * 100
      setFormData((prev) => ({
        ...prev,
        sale: Math.max(0, Math.round(salePercentage * 100) / 100),
      }))
    } else {
      setFormData((prev) => ({ ...prev, sale: 0 }))
    }
  }, [formData.price, formData.priceWithSale])

  // Calculate total sum when priceWithSale or quantity changes
  useEffect(() => {
    const totalSum = formData.priceWithSale * formData.quantity
    setFormData((prev) => ({ ...prev, totalSum }))
  }, [formData.priceWithSale, formData.quantity])

  const generatePublicId = async () => {
    try {
      setIsGeneratingId(true)
      const response = await apiService.generatePublicId()

      if (response.success.is && response.data.id) {
        setFormData((prev) => ({
          ...prev,
          productDetail: { ...prev.productDetail, publicId: response.data.id },
        }))
      } else {
        toast({
          title: "Xatolik",
          description: "Public ID yaratishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Generate public ID error:", error)
      toast({
        title: "Xatolik",
        description: "Public ID yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingId(false)
    }
  }

  const loadFurnitureTypes = async () => {
    try {
      setIsLoadingFurnitureTypes(true)
      const response = await apiService.getFurnitureTypes({
        pagination: false,
        search: furnitureTypeSearch || undefined,
      })

      if (response.success.is && response.data.data) {
        setFurnitureTypes(response.data.data)
      }
    } catch (error) {
      console.error("Load furniture types error:", error)
      toast({
        title: "Xatolik",
        description: "Mebel turlarini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFurnitureTypes(false)
    }
  }

  const loadModels = async () => {
    try {
      setIsLoadingModels(true)
      const response = await apiService.getModels({
        pagination: false,
        name: modelSearch || undefined,
        furnitureTypeId: selectedFurnitureTypeId,
      })

      if (response.success.is && response.data.data) {
        setModels(response.data.data)
      }
    } catch (error) {
      console.error("Load models error:", error)
      toast({
        title: "Xatolik",
        description: "Modellarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleProductDetailChange = (field: keyof FormData["productDetail"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      productDetail: { ...prev.productDetail, [field]: value },
    }))
  }

  const handleInputChange = (field: keyof Omit<FormData, "productDetail">, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFurnitureTypeChange = (value: string) => {
    setSelectedFurnitureTypeId(value)
    setFormData((prev) => ({
      ...prev,
      productDetail: { ...prev.productDetail, modelId: "" },
    }))
    setModelSearch("")
  }

  const handleClear = () => {
    setFormData(initialFormData)
    setSelectedFurnitureTypeId("")
    setFurnitureTypeSearch("")
    setModelSearch("")
    generatePublicId()
    toast({
      title: "Muvaffaqiyat",
      description: "Buyurtma muvaffaqiyatli qo'shildi",
    })
    toast({
      title: "Tozalandi",
      description: "Barcha maydonlar tozalandi",
    })
  }

  const handleCreate = async () => {
    // Validation
    if (!formData.productDetail.publicId || !formData.productDetail.modelId || !formData.productDetail.tissue) {
      toast({
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Xatolik",
        description: "Miqdor 0 dan katta bo'lishi kerak",
        variant: "destructive",
      })
      return
    }

    if (formData.price <= 0 || formData.priceWithSale <= 0) {
      toast({
        title: "Xatolik",
        description: "Narx va chegirmali narx 0 dan katta bo'lishi kerak",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await apiService.createCart(formData)

      if (response.success.is) {
        toast({
          title: "Muvaffaqiyat",
          description: "Buyurtma muvaffaqiyatli yaratildi",
        })
        toast({
          title: "Ma'lumot",
          description: "Barcha maydonlar tozalandi",
        })
        handleClear()
      } else {
        toast({
          title: "Xatolik",
          description: response.error.messages.join(", ") || "Buyurtma yaratishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Create order error:", error)
      toast({
        title: "Xatolik",
        description: "Buyurtma yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedModel = models.find((model) => model.id === formData.productDetail.modelId)
  const selectedFurnitureType = furnitureTypes.find((type) => type.id === selectedFurnitureTypeId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yangi buyurtma</h1>
        <p className="text-muted-foreground">Yangi buyurtma yaratish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Mahsulot tafsilotlari
              </CardTitle>
              <CardDescription>Buyurtma uchun mahsulot ma'lumotlarini kiriting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Public ID */}
                <div className="space-y-2">
                  <Label htmlFor="publicId">
                    Public ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="publicId"
                      value={formData.productDetail.publicId}
                      disabled
                      placeholder="Avtomatik yaratiladi"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generatePublicId}
                      disabled={isGeneratingId}
                    >
                      {isGeneratingId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Direction */}
                <div className="space-y-2">
                  <Label htmlFor="direction">Yo'nalish</Label>
                  <Select
                    value={formData.productDetail.direction}
                    onValueChange={(value: "left" | "right" | "none") => handleProductDetailChange("direction", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yo'nalishni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Yo'q</SelectItem>
                      <SelectItem value="left">Chap</SelectItem>
                      <SelectItem value="right">O'ng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Furniture Type */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="furnitureType">
                    Mebel turi <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedFurnitureTypeId} onValueChange={handleFurnitureTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mebel turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Mebel turini qidiring..."
                          value={furnitureTypeSearch}
                          onChange={(e) => setFurnitureTypeSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {isLoadingFurnitureTypes ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Yuklanmoqda...</span>
                        </div>
                      ) : furnitureTypes.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Mebel turi topilmadi</div>
                      ) : (
                        furnitureTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedFurnitureType && (
                    <div className="text-sm text-muted-foreground">Tanlangan: {selectedFurnitureType.name}</div>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="model">
                    Model <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.productDetail.modelId}
                    onValueChange={(value) => handleProductDetailChange("modelId", value)}
                    disabled={!selectedFurnitureTypeId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={selectedFurnitureTypeId ? "Modelni tanlang" : "Avval mebel turini tanlang"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFurnitureTypeId && (
                        <div className="p-2">
                          <Input
                            placeholder="Modelni qidiring..."
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                      )}
                      {isLoadingModels ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Yuklanmoqda...</span>
                        </div>
                      ) : models.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {selectedFurnitureTypeId ? "Model topilmadi" : "Mebel turini tanlang"}
                        </div>
                      ) : (
                        models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Ta'minotchi: {model.provider.fullname}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedModel && (
                    <div className="text-sm text-muted-foreground">Ta'minotchi: {selectedModel.provider.fullname}</div>
                  )}
                </div>

                {/* Tissue */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tissue">
                    To'qima <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tissue"
                    value={formData.productDetail.tissue}
                    onChange={(e) => handleProductDetailChange("tissue", e.target.value)}
                    placeholder="To'qima turini kiriting"
                  />
                </div>
              </div>

              <Separator />

              {/* Order Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Buyurtma tafsilotlari</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Miqdor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 1)}
                      placeholder="Miqdorni kiriting"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Tavsif</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Qo'shimcha ma'lumotlar..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Calculation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Narx hisoblash
              </CardTitle>
              <CardDescription>Narx va chegirma ma'lumotlari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Asosiy narx <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Asosiy narxni kiriting"
                />
              </div>

              {/* Price with Sale */}
              <div className="space-y-2">
                <Label htmlFor="priceWithSale">
                  Chegirmali narx <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="priceWithSale"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceWithSale || ""}
                  onChange={(e) => handleInputChange("priceWithSale", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Chegirmali narxni kiriting"
                />
              </div>

              <Separator />

              {/* Calculated Values */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Chegirma:</span>
                  <span className="text-sm font-bold text-green-600">{formData.sale.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Umumiy summa:</span>
                  <span className="text-lg font-bold text-blue-600">{formData.totalSum.toLocaleString()} so'm</span>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={
                    isLoading ||
                    !formData.productDetail.publicId ||
                    !formData.productDetail.modelId ||
                    !formData.productDetail.tissue ||
                    formData.price <= 0 ||
                    formData.priceWithSale <= 0
                  }
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Buyurtma yaratish
                </Button>

                <Button type="button" variant="outline" onClick={handleClear} disabled={isLoading} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tozalash
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
