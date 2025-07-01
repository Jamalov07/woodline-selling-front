"use client"

import {
  Building2,
  ChevronRight,
  Users,
  Warehouse,
  Home,
  UserCheck,
  ShoppingCart,
  Package,
  UserPlus,
  Truck,
  Store,
  Building,
  Sofa,
  Layers,
  Box,
  ClipboardList,
  Plus,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Shield,
  Settings,
  Zap,
  Calendar,
  type LucideIcon,
  PackageCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

interface SubMenuItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
}

interface MenuItem {
  title: string
  icon: LucideIcon
  items: SubMenuItem[]
}

export function AppSidebar() {
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)

  // Count larni yuklash
  useEffect(() => {
    loadCounts()
    // Har 30 soniyada yangilab turish
    const interval = setInterval(loadCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadCounts = async () => {
    await Promise.all([loadCartCount(), loadBookingCount()])
  }

  const loadBookingCount = async () => {
    try {
      const response = await apiService.getMyBookings({ pagination: false })
      if (response.success.is && response.data) {
        setBookingCount(response.data.totalCount || 0)
      }
    } catch (error) {
      console.error("Load booking count error:", error)
    }
  }

  const loadCartCount = async () => {
    try {
      const response = await apiService.getMyCartItems({ pagination: false })
      if (response.success.is && response.data) {
        setCartCount(response.data.totalCount || 0)
      }
    } catch (error) {
      console.error("Load cart count error:", error)
    }
  }

  const handleLogoClick = () => {
    router.refresh()
  }

  const menuItems: MenuItem[] = [
    {
      title: "Foydalanuvchilar",
      icon: Users,
      items: [
        {
          title: "Adminlar",
          url: "/dashboard/users/admins",
          icon: UserCheck,
        },
        {
          title: "Sotuvchilar",
          url: "/dashboard/users/sellers",
          icon: ShoppingCart,
        },
        {
          title: "Omborchilar",
          url: "/dashboard/users/storekeepers",
          icon: Package,
        },
        {
          title: "Mijozlar",
          url: "/dashboard/users/clients",
          icon: UserPlus,
        },
        {
          title: "Ta'minotchilar",
          url: "/dashboard/users/providers",
          icon: Truck,
        },
      ],
    },
    {
      title: "Mahsulotlar",
      icon: Box,
      items: [
        {
          title: "Mebel turlari",
          url: "/dashboard/products/furnituretypes",
          icon: Sofa,
        },
        {
          title: "Modellar",
          url: "/dashboard/products/models",
          icon: Layers,
        },
        {
          title: "Mahsulotlar",
          url: "/dashboard/products/products",
          icon: Package,
        },
      ],
    },
    {
      title: "Buyurtmalar",
      icon: ClipboardList,
      items: [
        {
          title: "Yangi buyurtma",
          url: "/dashboard/orders/new-order",
          icon: Plus,
        },
        {
          title: "Booking",
          url: "/dashboard/cart/booking",
          icon: Calendar,
          badge: bookingCount > 0 ? bookingCount.toString() : undefined,
        },
        {
          title: "Savat",
          url: "/dashboard/cart/cart",
          icon: ShoppingCart,
          badge: cartCount > 0 ? cartCount.toString() : undefined,
        },
        {
          title: "Mening buyurtmalarim",
          url: "/dashboard/orders/my-orders",
          icon: FileText,
        },
        {
          title: "Buyurtma mahsulotlari",
          url: "/dashboard/orders/order-products",
          icon: PackageCheck
        },
      ],
    },
    {
      title: "Kirim-Chiqim",
      icon: TrendingUp,
      items: [
        {
          title: "Kirim",
          url: "/dashboard/transactions/income",
          icon: TrendingUp,
        },
        {
          title: "Chiqim",
          url: "/dashboard/transactions/expense",
          icon: TrendingDown,
        },
        {
          title: "Transfer",
          url: "/dashboard/transactions/transfer",
          icon: ArrowRightLeft,
        },
      ],
    },
    {
      title: "Rollar",
      icon: Shield,
      items: [
        {
          title: "Rollar",
          url: "/dashboard/roles/roles",
          icon: Settings,
        },
        {
          title: "Amallar",
          url: "/dashboard/roles/actions",
          icon: Zap,
        },
      ],
    },
    {
      title: "Omborlar",
      icon: Warehouse,
      items: [
        {
          title: "Ombor",
          url: "/dashboard/storehouses/warehouse",
          icon: Building,
        },
        {
          title: "Showroom",
          url: "/dashboard/storehouses/showroom",
          icon: Store,
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={handleLogoClick} className="cursor-pointer">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">CRM System</span>
                <span className="truncate text-xs">Boshqaruv tizimi</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Home />
                    <span>Bosh sahifa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Boshqaruv</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible key={item.title} asChild defaultOpen={false}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <CollapsibleTrigger>
                        <item.icon size={16} />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <subItem.icon size={16} />
                                  <span>{subItem.title}</span>
                                </div>
                                {subItem.badge && (
                                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
