"use client"

import * as React from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronsUpDown, Check } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

type Provider = {
  id: string
  fullname: string
  phone: string
}

type Storehouse = {
  id: string
  name: string
}

type Product = {
  id: string
  publicId: string
  model: {
    name: string
    furnitureType: {
      name: string
    }
  }
}

type ProductEntry = {
  product: Product | null
  activeQty: number
  defectedQty: number
}

interface AddPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPurchaseDialog({ open, onOpenChange, onSuccess }: AddPurchaseDialogProps) {
  /* ------------------------------------------------------------------ */
  /*                    Remote data + searching hooks                   */
  /* ------------------------------------------------------------------ */
  const [providerSearch, setProviderSearch] = React.useState("")
  const [providers, setProviders] = React.useState<Provider[]>([])
  const [providerLoading, setProviderLoading] = React.useState(false)

  const fetchProviders = React.useCallback(async (q: string) => {
    try {
      setProviderLoading(true)
      console.log("Fetching providers with search:", q)

      const resp = await apiService.getUsers({
        pagination: false,
        roleNames: ["provider"],
        search: q || undefined,
      })

      console.log("Providers response:", resp)

      if (resp.success.is) {
        // Handle both paginated and non-paginated responses
        const providersData = resp.data.data || resp.data || []
        console.log("Providers data:", providersData)
        setProviders(Array.isArray(providersData) ? providersData : [])
      } else {
        console.error("Failed to fetch providers:", resp)
        setProviders([])
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      setProviders([])
    } finally {
      setProviderLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      fetchProviders(providerSearch)
    }
  }, [providerSearch, fetchProviders, open])

  const [storehouseSearch, setStorehouseSearch] = React.useState("")
  const [storehouses, setStorehouses] = React.useState<Storehouse[]>([])
  const [storehouseLoading, setStorehouseLoading] = React.useState(false)

  const fetchStorehouses = React.useCallback(async (q: string) => {
    try {
      setStorehouseLoading(true)
      console.log("Fetching storehouses with search:", q)

      const resp = await apiService.getStorehouses({
        pagination: false,
        type: "warehouse",
        name: q || undefined,
      })

      console.log("Storehouses response:", resp)

      if (resp.success.is) {
        // Handle both paginated and non-paginated responses
        const storehousesData = resp.data.data || resp.data || []
        console.log("Storehouses data:", storehousesData)
        setStorehouses(Array.isArray(storehousesData) ? storehousesData : [])
      } else {
        console.error("Failed to fetch storehouses:", resp)
        setStorehouses([])
      }
    } catch (error) {
      console.error("Error fetching storehouses:", error)
      setStorehouses([])
    } finally {
      setStorehouseLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      fetchStorehouses(storehouseSearch)
    }
  }, [storehouseSearch, fetchStorehouses, open])

  const [productSearch, setProductSearch] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [productLoading, setProductLoading] = React.useState(false)

  const fetchProducts = React.useCallback(async (q: string) => {
    try {
      setProductLoading(true)
      console.log("Fetching products with search:", q)

      const resp = await apiService.getProducts({
        pagination: false,
        type: "standart",
        search: q || undefined,
      })

      console.log("Products response:", resp)

      if (resp.success.is) {
        // Handle both paginated and non-paginated responses
        const productsData = resp.data.data || resp.data || []
        console.log("Products data:", productsData)
        setProducts(Array.isArray(productsData) ? productsData : [])
      } else {
        console.error("Failed to fetch products:", resp)
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setProductLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      fetchProducts(productSearch)
    }
  }, [productSearch, fetchProducts, open])

  /* ------------------------------------------------------------------ */
  /*                         Local component state                      */
  /* ------------------------------------------------------------------ */
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null)
  const [selectedStorehouse, setSelectedStorehouse] = React.useState<Storehouse | null>(null)
  const [productsList, setProductsList] = React.useState<ProductEntry[]>([
    { product: null, activeQty: 0, defectedQty: 0 },
  ])
  const [submitting, setSubmitting] = React.useState(false)

  const addProductRow = () => setProductsList((prev) => [...prev, { product: null, activeQty: 0, defectedQty: 0 }])

  const removeProductRow = (idx: number) => setProductsList((prev) => prev.filter((_, i) => i !== idx))

  /* ------------------------------------------------------------------ */
  /*                              Helpers                               */
  /* ------------------------------------------------------------------ */
  const isRowValid = ({ activeQty, defectedQty, product }: ProductEntry) =>
    product && (activeQty > 0 || defectedQty > 0)

  const validateForm = () => {
    if (!selectedProvider) return "Taʼminotchi tanlanmagan"
    if (!selectedStorehouse) return "Ombor tanlanmagan"
    if (productsList.length === 0) return "Mahsulotlar qoʻshilmagan"
    if (!productsList.every(isRowValid)) return "Har bir mahsulot uchun hech boʼlmasa bitta miqdor kiriting"
    return null
  }

  const resetState = () => {
    setSelectedProvider(null)
    setSelectedStorehouse(null)
    setProductsList([{ product: null, activeQty: 0, defectedQty: 0 }])
    setProviderSearch("")
    setStorehouseSearch("")
    setProductSearch("")
  }

  /* ------------------------------------------------------------------ */
  /*                             Submission                             */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    const productMVs = productsList.flatMap((p) => {
      const arr: { id: string; status: string; quantity: number }[] = []
      if (p.activeQty > 0) arr.push({ id: p.product!.id, status: "active", quantity: p.activeQty })
      if (p.defectedQty > 0) arr.push({ id: p.product!.id, status: "defected", quantity: p.defectedQty })
      return arr
    })

    try {
      setSubmitting(true)
      console.log("Creating purchase with data:", {
        providerId: selectedProvider!.id,
        storehouseId: selectedStorehouse!.id,
        productMVs,
      })

      const resp = await apiService.createPurchase({
        providerId: selectedProvider!.id,
        storehouseId: selectedStorehouse!.id,
        productMVs,
      })

      console.log("Create purchase response:", resp)

      if (resp.success.is) {
        toast.success("Kirim muvaffaqiyatli qo'shildi")
        onSuccess()
        onOpenChange(false)
        resetState()
      } else {
        toast.error("Kirimni saqlashda xatolik")
      }
    } catch (e) {
      console.error("Error creating purchase:", e)
      toast.error("Kirimni saqlashda xatolik")
    } finally {
      setSubmitting(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /*                             UI parts                               */
  /* ------------------------------------------------------------------ */
  const Combobox = <T extends { id: string } & Record<string, any>>({
    items,
    loading,
    searchValue,
    onSearch,
    displayValue,
    placeholder,
    selected,
    onSelect,
  }: {
    items: T[]
    loading: boolean
    searchValue: string
    onSearch: (v: string) => void
    displayValue: (item: T) => string
    placeholder: string
    selected: T | null
    onSelect: (item: T) => void
  }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
            {selected ? displayValue(selected) : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Qidirish..." value={searchValue} onValueChange={onSearch} autoFocus />
            <CommandList className="max-h-56">
              {loading ? (
                <div className="p-4 text-sm">Yuklanmoqda...</div>
              ) : (
                <>
                  <CommandEmpty>Maʼlumot topilmadi</CommandEmpty>
                  {Array.isArray(items) && items.length > 0 ? (
                    <ScrollArea className="h-full">
                      {items.map((it) => (
                        <CommandItem
                          key={it.id}
                          onSelect={() => {
                            onSelect(it)
                            setOpen(false)
                          }}
                          className="flex justify-between"
                        >
                          {displayValue(it)}
                          {selected?.id === it.id && <Check className="h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">Maʼlumot topilmadi</div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  /* ------------------------------------------------------------------ */
  /*                               Render                               */
  /* ------------------------------------------------------------------ */
  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      {/* an invisible trigger required by shadcn */}
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yangi kirim qoʻshish</DialogTitle>
        </DialogHeader>

        {/* Provider & Storehouse */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Taʼminotchi</Label>
            <Combobox
              items={providers}
              loading={providerLoading}
              searchValue={providerSearch}
              onSearch={setProviderSearch}
              displayValue={(p: Provider) => `${p.fullname} (${p.phone})`}
              placeholder="Taʼminotchini tanlang"
              selected={selectedProvider}
              onSelect={(p: Provider) => setSelectedProvider(p)}
            />
            {providers.length === 0 && !providerLoading && (
              <p className="text-sm text-muted-foreground">Taʼminotchilar topilmadi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ombor</Label>
            <Combobox
              items={storehouses}
              loading={storehouseLoading}
              searchValue={storehouseSearch}
              onSearch={setStorehouseSearch}
              displayValue={(s: Storehouse) => s.name}
              placeholder="Omborni tanlang"
              selected={selectedStorehouse}
              onSelect={(s: Storehouse) => setSelectedStorehouse(s)}
            />
            {storehouses.length === 0 && !storehouseLoading && (
              <p className="text-sm text-muted-foreground">Omborlar topilmadi</p>
            )}
          </div>
        </div>

        {/* Products table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mahsulotlar</Label>
            <Button variant="outline" size="sm" onClick={addProductRow}>
              <Plus className="h-3 w-3 mr-1" /> Yangi qator
            </Button>
          </div>

          <div className="space-y-3 max-h-80 overflow-auto pr-2">
            {productsList.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
                {/* product selector */}
                <div className="col-span-5 space-y-1">
                  {idx === 0 && <Label className="sr-only">Mahsulot</Label>}
                  <Combobox
                    items={products}
                    loading={productLoading}
                    searchValue={productSearch}
                    onSearch={setProductSearch}
                    displayValue={(p: Product) => `${p.publicId} - ${p.model.name} (${p.model.furnitureType.name})`}
                    placeholder="Mahsulotni tanlang"
                    selected={row.product}
                    onSelect={(p: Product) =>
                      setProductsList((prev) => prev.map((r, i) => (i === idx ? { ...r, product: p } : r)))
                    }
                  />
                  {products.length === 0 && !productLoading && idx === 0 && (
                    <p className="text-xs text-muted-foreground">Mahsulotlar topilmadi</p>
                  )}
                </div>

                {/* active qty */}
                <div className="col-span-2 space-y-1">
                  {idx === 0 && <Label className="sr-only">Active</Label>}
                  <Input
                    type="number"
                    min={0}
                    placeholder="Active"
                    value={row.activeQty || ""}
                    onChange={(e) =>
                      setProductsList((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, activeQty: Number(e.target.value) } : r)),
                      )
                    }
                  />
                </div>

                {/* defected qty */}
                <div className="col-span-2 space-y-1">
                  {idx === 0 && <Label className="sr-only">Defected</Label>}
                  <Input
                    type="number"
                    min={0}
                    placeholder="Defected"
                    value={row.defectedQty || ""}
                    onChange={(e) =>
                      setProductsList((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, defectedQty: Number(e.target.value) } : r)),
                      )
                    }
                  />
                </div>

                {/* remove button */}
                <div className="col-span-3 flex items-center">
                  {productsList.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeProductRow(idx)}>
                      Olib tashlash
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Bekor qilish
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
