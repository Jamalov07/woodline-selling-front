const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:5000"

interface ApiResponse<T = any> {
  data: T
  status: number
  success: {
    is: boolean
    messages: string[]
  }
  error: {
    is: boolean
    messages: string[]
  }
  warning: {
    is: boolean
    messages: string[]
  }
}

interface Storehouse {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  type: "warehouse" | "showroom"
}

interface StorehouseListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: Storehouse[]
}

interface Role {
  name: string
  actions: Action[]
}

interface Action {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  url: string
  name: string
  method: string
  description: string
  roles?: Role[]
}

interface User {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  phone: string
  fullname: string
  source?: string
  storehouseId?: string
  balance?: string
  storehouse?: {
    storehouse: {
      id: string
      name: string
      type: "warehouse" | "showroom"
    }
  }
  roles: Role[]
  actions: Action[]
}

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
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  furnitureType: {
    id: string
    name: string
    createdAt: string
  }
  provider: {
    id: string
    fullname: string
    phone: string
    balance: string
    createdAt: string
  }
}

interface Product {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
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

interface RoleListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: Role[]
}

interface ActionListResponse {
  totalCount: number
  pagesCount: number
  pageSize: number
  data: Action[]
}

interface UserListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: User[]
}

interface FurnitureTypeListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: FurnitureType[]
}

interface ModelListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: Model[]
}

interface ProductListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: Product[]
}

interface StorehouseProductStatus {
  id: string
  createdAt: string
  quantity: number
  status: "pending" | "active" | "defected"
  carts: Array<{
    id: string
    quantity: number
  }>
  bookings: Array<{
    id: string
    quantity: number
    sellerId: string
  }>
  orderProducts?: Array<{
    id: string
    quantity: number
  }>
  sp: {
    product: {
      id: string
      createdAt: string
      description: string
      direction: "left" | "right" | "none"
      publicId: string
      quantity: number
      model: {
        id: string
        createdAt: string
        name: string
        furnitureType: {
          id: string
          name: string
          createdAt: string
        }
      }
      tissue: string
      type: "standart" | "nonstandart"
    }
    storehouse: {
      id: string
      type: "warehouse" | "showroom"
      name: string
      createdAt: string
    }
  }
}

interface StorehouseProductStatusListResponse {
  totalCount: number
  pagesCount: number
  pageSize: number
  data: StorehouseProductStatus[]
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

interface Payment {
  id: string
  createdAt: string
  description: string
  exchangeRate: string | number
  fromCurrency: PaymentCurrency
  method: PaymentMethod
  sum: string | number
  toCurrency: PaymentCurrency
  totalSum: string | number
}

interface OrderProduct {
  id: string
  createdAt: string
  description: string
  price: string
  priceWithSale: string
  quantity: number
  sale: number
  totalSum: string
  status: "new" | "sold"
  type: "standart" | "nonstandart"
  sps: {
    sp: {
      product: {
        direction: "left" | "right" | "none"
        publicId: string
        tissue: string
        model: {
          id: string
          createdAt: string
          name: string
          furnitureType: {
            id: string
            name: string
            createdAt: string
          }
        }
      }
    }
  }
}

interface Order {
  id: string
  createdAt: string
  client: {
    id: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    phone: string
    fullname: string
    source: string
    balance: string
  }
  seller: {
    id: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    phone: string
    fullname: string
    source: string
    balance: string
  }
  deliveryAddress: string
  deliveryDate: string
  clientPStatus: string
  status: "new" | "processing" | "completed" | "cancelled"
  payments: Payment[]
  products: OrderProduct[]
}

interface OrderListResponse {
  totalCount: number
  pagesCount: number
  pageSize: number
  data: Order[]
}

interface Client {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  phone: string
  fullname: string
  source: string
  balance: string
}

interface ClientListResponse {
  totalCount?: number
  pagesCount?: number
  pageSize?: number
  data: Client[]
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("access_token")

    const makeRequest = async (accessToken?: string) => {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...options.headers,
        },
      })

      if (response.status === 401 && accessToken) {
        // Token expired, try to refresh
        const refreshSuccess = await this.refreshToken()
        if (refreshSuccess) {
          const newToken = localStorage.getItem("access_token")
          return makeRequest(newToken || undefined)
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
          throw new Error("Authentication failed")
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    }

    return makeRequest(token || undefined)
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) return false

      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) return false

      const data = await response.json()
      if (data.success.is && data.data.tokens) {
        localStorage.setItem("access_token", data.data.tokens.accessToken)
        localStorage.setItem("refresh_token", data.data.tokens.refreshToken)
        return true
      }

      return false
    } catch (error) {
      console.error("Refresh token error:", error)
      return false
    }
  }

  // Auth methods
  async login(phone: string, password: string): Promise<ApiResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/user/profile")
  }

  // Storehouse methods
  async getStorehouses(
    params: {
      type?: "warehouse" | "showroom"
      pageNumber?: number
      pageSize?: number
      name?: string
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<StorehouseListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.type) searchParams.append("type", params.type)
    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.name) searchParams.append("search", params.name)
    searchParams.append("pagination", "true")

    return this.request<StorehouseListResponse>(`/storehouse/many?${searchParams}`)
  }

  async createStorehouse(data: {
    name: string
    type: "warehouse" | "showroom"
  }): Promise<ApiResponse> {
    return this.request("/storehouse/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateStorehouse(id: string, data: { name: string }): Promise<ApiResponse> {
    return this.request(`/storehouse/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteStorehouse(id: string): Promise<ApiResponse> {
    return this.request(`/storehouse/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getStorehouseById(id: string): Promise<ApiResponse<Storehouse>> {
    return this.request<Storehouse>(`/storehouse/one?id=${id}`)
  }

  // Role methods
  async getRoles(
    params: {
      pageNumber?: number
      pageSize?: number
      name?: string
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<RoleListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.name) searchParams.append("search", params.name)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<RoleListResponse>(`/role/many?${searchParams}`)
  }

  async getRole(name: string): Promise<ApiResponse<Role>> {
    return this.request<Role>(`/role/one?name=${encodeURIComponent(name)}`)
  }

  async updateRole(
    name: string,
    data: {
      actionsToConnect?: string[]
      actionsToDisconnect?: string[]
    },
  ): Promise<ApiResponse> {
    return this.request(`/role/one?name=${encodeURIComponent(name)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async createRole(data: any): Promise<ApiResponse> {
    return this.request("/role/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateRoleById(id: string, data: any): Promise<ApiResponse> {
    return this.request(`/role/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteRole(id: string): Promise<ApiResponse> {
    return this.request(`/role/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getRoleById(id: string): Promise<ApiResponse<Role>> {
    return this.request<Role>(`/role/one?id=${id}`)
  }

  // Action methods
  async getActions(
    params: {
      pageNumber?: number
      pageSize?: number
      name?: string
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<ActionListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.name) searchParams.append("search", params.name)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<ActionListResponse>(`/action/many?${searchParams}`)
  }

  async getAction(id: string): Promise<ApiResponse<Action>> {
    return this.request<Action>(`/action/one?id=${id}`)
  }

  async updateAction(
    id: string,
    data: {
      description?: string
      rolesToConnect?: string[]
      rolesToDisconnect?: string[]
    },
  ): Promise<ApiResponse> {
    return this.request(`/action/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async createAction(data: any): Promise<ApiResponse> {
    return this.request("/action/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateActionById(id: string, data: any): Promise<ApiResponse> {
    return this.request(`/action/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteAction(id: string): Promise<ApiResponse> {
    return this.request(`/action/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getActionById(id: string): Promise<ApiResponse<Action>> {
    return this.request<Action>(`/action/one?id=${id}`)
  }

  // User methods
  async getUsers(
    params: {
      pageNumber?: number
      pageSize?: number
      search?: string
      roleNames?: string[]
      pagination?: boolean
      phone?: string
    } = {},
  ): Promise<ApiResponse<UserListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.phone) searchParams.append("phone", params.phone)
    if (params.roleNames && params.roleNames.length > 0) {
      params.roleNames.forEach((role) => searchParams.append("roleNames", role))
    }
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<UserListResponse>(`/user/many?${searchParams}`)
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/one?id=${id}`)
  }

  async createUser(data: {
    phone: string
    fullname: string
    password: string
    rolesToConnect: string[]
    actionsToConnect?: string[]
    source?: string
    storehouseId?: string
  }): Promise<ApiResponse> {
    return this.request("/user/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(
    id: string,
    data: {
      phone?: string
      fullname?: string
      password?: string
      rolesToConnect?: string[]
      rolesToDisconnect?: string[]
      actionsToConnect?: string[]
      actionsToDisconnect?: string[]
      source?: string
      storehouseId?: string
    },
  ): Promise<ApiResponse> {
    return this.request(`/user/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/user/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/one?id=${id}`)
  }

  // Furniture Type methods
  async getFurnitureTypes(
    params: {
      pageNumber?: number
      pageSize?: number
      search?: string
      pagination?: boolean
      name?: string
    } = {},
  ): Promise<ApiResponse<FurnitureTypeListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<FurnitureTypeListResponse>(`/furniture-type/many?${searchParams}`)
  }

  async createFurnitureType(data: { name: string }): Promise<ApiResponse> {
    return this.request("/furniture-type/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateFurnitureType(id: string, data: { name: string }): Promise<ApiResponse> {
    return this.request(`/furniture-type/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteFurnitureType(id: string): Promise<ApiResponse> {
    return this.request(`/furniture-type/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getFurnitureTypeById(id: string): Promise<ApiResponse<FurnitureType>> {
    return this.request<FurnitureType>(`/furniture-type/one?id=${id}`)
  }

  // Model methods
  async getModels(
    params: {
      pageNumber?: number
      pageSize?: number
      name?: string
      pagination?: boolean
      furnitureTypeId?: string
    } = {},
  ): Promise<ApiResponse<ModelListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.name) searchParams.append("search", params.name)
    if (params.furnitureTypeId) searchParams.append("furnitureTypeId", params.furnitureTypeId)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<ModelListResponse>(`/model/many?${searchParams}`)
  }

  async createModel(data: {
    name: string
    furnitureTypeId: string
    providerId: string
  }): Promise<ApiResponse> {
    return this.request("/model/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateModel(
    id: string,
    data: {
      name: string
      furnitureTypeId: string
      providerId: string
    },
  ): Promise<ApiResponse> {
    return this.request(`/model/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteModel(id: string): Promise<ApiResponse> {
    return this.request(`/model/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getModelById(id: string): Promise<ApiResponse<Model>> {
    return this.request<Model>(`/model/one?id=${id}`)
  }

  // Product methods
  async getProducts(
    params: {
      pageNumber?: number
      pageSize?: number
      search?: string
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<ProductListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<ProductListResponse>(`/product/many?${searchParams}`)
  }

  async createProduct(data: {
    publicId: string
    modelId: string
    tissue: string
    quantity: number
    direction: "left" | "right" | "none"
    description: string
    type: "standart" | "nonstandart"
  }): Promise<ApiResponse> {
    return this.request("/product/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProduct(
    id: string,
    data: {
      publicId: string
      modelId: string
      tissue: string
      quantity: number
      direction: "left" | "right" | "none"
      description: string
      type: "standart" | "nonstandart"
    },
  ): Promise<ApiResponse> {
    return this.request(`/product/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/product/one?id=${id}`, {
      method: "DELETE",
    })
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/product/one?id=${id}`)
  }

  async generatePublicId(): Promise<ApiResponse> {
    return this.request("/public-id/generate", { method: "GET" })
  }

  // Cart methods
  async createCart(data: {
    spsId: string
    quantity: number
    description: string
    sale: number
    priceWithSale: number
    price: number
    totalSum: number
  }): Promise<ApiResponse> {
    return this.request("/cart/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getMyCartItems(
    params: {
      pageNumber?: number
      pageSize?: number
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request(`/cart/my/many?${searchParams}`)
  }

  async updateCart(
    cartId: string,
    data: {
      quantity?: number
      description?: string
      price?: number
      priceWithSale?: number
      sale?: number
      totalSum?: number
      productDetail?: {
        direction?: "left" | "right" | "none"
        tissue?: string
        modelId?: string
        quantity?: number
      }
    },
  ): Promise<ApiResponse> {
    return this.request(`/cart/one?id=${cartId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteCart(cartId: string): Promise<ApiResponse> {
    return this.request(`/cart/one?id=${cartId}`, {
      method: "DELETE",
    })
  }

  // Booking methods
  async createBooking(data: {
    spsId: string
    quantity: number
  }): Promise<ApiResponse> {
    return this.request("/storehouse-product-status-booking/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateBooking(
    bookingId: string,
    data: {
      quantity: number
    },
  ): Promise<ApiResponse> {
    return this.request(`/storehouse-product-status-booking/one?id=${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async getMyBookings(
    params: {
      pageNumber?: number
      pageSize?: number
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    // Hozirgi userning ID sini static qo'shamiz (keyinchalik dinamik qilish mumkin)
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.id) {
        searchParams.append("sellerId", user.id)
      }
    }

    return this.request(`/storehouse-product-status-booking/many?${searchParams}`)
  }

  async deleteBooking(bookingId: string): Promise<ApiResponse> {
    return this.request(`/storehouse-product-status-booking/one?id=${bookingId}`, {
      method: "DELETE",
    })
  }

  async addToBooking(data: any): Promise<ApiResponse> {
    return this.request("/storehouse-product-status-booking/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async removeFromBooking(id: string): Promise<ApiResponse> {
    return this.request(`/storehouse-product-status-booking/one?id=${id}`, {
      method: "DELETE",
    })
  }

  // Order methods
  async createOrder(data: {
    deliveryDate: string
    deliveryAddress: string
    clientId: string
    payments: Omit<Payment,"id"|"createdAt"|"toCurrency">[]
  }): Promise<ApiResponse> {
    return this.request("/order/one-with-payment-product", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getMyOrders(
    params: {
      pageNumber?: number
      pageSize?: number
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<OrderListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    // Hozirgi userning ID sini sellerId sifatida qo'shamiz
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.id) {
        searchParams.append("sellerId", user.id)
      }
    }

    return this.request<OrderListResponse>(`/order/many?${searchParams}`)
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/order/one?id=${id}`)
  }

  // Clients methods
  async getClients(
    params: {
      pageNumber?: number
      pageSize?: number
      search?: string
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<ClientListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.search) searchParams.append("search", params.search)
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<ClientListResponse>(`/client/many?${searchParams}`)
  }

  async getClientById(id: string): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/client/one?id=${id}`)
  }

  async createClient(data: any): Promise<ApiResponse> {
    return this.request("/client/one", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateClient(id: string, data: any): Promise<ApiResponse> {
    return this.request(`/client/one?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    return this.request(`/client/one?id=${id}`, {
      method: "DELETE",
    })
  }

  // Storehouse Product Status methods
  async getStorehouseProductStatuses(
    params: {
      pageNumber?: number
      pageSize?: number
      pagination?: boolean
    } = {},
  ): Promise<ApiResponse<StorehouseProductStatusListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pagination !== undefined) {
      searchParams.append("pagination", params.pagination.toString())
    } else {
      searchParams.append("pagination", "true")
    }

    return this.request<StorehouseProductStatusListResponse>(`/storehouse-product-status/many?${searchParams}`)
  }
}

export const apiService = new ApiService()
export type {
  Storehouse,
  ApiResponse,
  Role,
  Action,
  User,
  FurnitureType,
  Model,
  Product,
  StorehouseProductStatus,
  PaymentMethod,
  PaymentCurrency,
  Payment,
  Order,
  OrderProduct,
  OrderListResponse,
  Client,
}
