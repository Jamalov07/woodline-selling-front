const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:3000";

interface ApiResponse<T = any> {
    data: T;
    status: number;
    success: {
        is: boolean;
        messages: string[];
    };
    error: {
        is: boolean;
        messages: string[];
    };
    warning: {
        is: boolean;
        messages: string[];
    };
}

interface Storehouse {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    type: "warehouse" | "showroom";
}

interface StorehouseListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: Storehouse[];
}

interface Role {
    name: string;
    actions: Action[];
}

interface Action {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    url: string;
    name: string;
    method: string;
    description: string;
    roles?: Role[];
}

interface User {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    phone: string;
    fullname: string;
    source?: string;
    storehouseId?: string;
    balance?: string;
    storehouse?: {
        storehouse: {
            id: string;
            name: string;
            type: "warehouse" | "showroom";
        };
    };
    roles: Role[];
    actions: Action[];
}

interface FurnitureType {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

interface Model {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    furnitureType: {
        id: string;
        name: string;
        createdAt: string;
    };
    provider: {
        id: string;
        fullname: string;
        phone: string;
        balance: string;
        createdAt: string;
    };
}

interface Product {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

interface RoleListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: Role[];
}

interface ActionListResponse {
    totalCount: number;
    pagesCount: number;
    pageSize: number;
    data: Action[];
}

interface UserListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: User[];
}

interface FurnitureTypeListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: FurnitureType[];
}

interface ModelListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: Model[];
}

interface ProductListResponse {
    totalCount?: number;
    pagesCount?: number;
    pageSize?: number;
    data: Product[];
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Storehouse methods
    async getStorehouses(
        params: {
            type?: "warehouse" | "showroom";
            pageNumber?: number;
            pageSize?: number;
            name?: string;
            pagination?: boolean;
        } = {}
    ): Promise<ApiResponse<StorehouseListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.type) searchParams.append("type", params.type);
        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.name) searchParams.append("search", params.name);
        searchParams.append("pagination", "true");

        return this.request<StorehouseListResponse>(
            `/storehouse/many?${searchParams}`
        );
    }

    async createStorehouse(data: {
        name: string;
        type: "warehouse" | "showroom";
    }): Promise<ApiResponse> {
        return this.request("/storehouse/one", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateStorehouse(
        id: string,
        data: { name: string }
    ): Promise<ApiResponse> {
        return this.request(`/storehouse/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteStorehouse(id: string): Promise<ApiResponse> {
        return this.request(`/storehouse/one?id=${id}`, {
            method: "DELETE",
        });
    }

    // Role methods
    async getRoles(
        params: {
            pageNumber?: number;
            pageSize?: number;
            name?: string;
            pagination?: boolean;
        } = {}
    ): Promise<ApiResponse<RoleListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.name) searchParams.append("search", params.name);
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<RoleListResponse>(`/role/many?${searchParams}`);
    }

    async getRole(name: string): Promise<ApiResponse<Role>> {
        return this.request<Role>(`/role/one?name=${encodeURIComponent(name)}`);
    }

    async updateRole(
        name: string,
        data: {
            actionsToConnect?: string[];
            actionsToDisconnect?: string[];
        }
    ): Promise<ApiResponse> {
        return this.request(`/role/one?name=${encodeURIComponent(name)}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    // Action methods
    async getActions(
        params: {
            pageNumber?: number;
            pageSize?: number;
            name?: string;
            pagination?: boolean;
        } = {}
    ): Promise<ApiResponse<ActionListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.name) searchParams.append("search", params.name);
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<ActionListResponse>(`/action/many?${searchParams}`);
    }

    async getAction(id: string): Promise<ApiResponse<Action>> {
        return this.request<Action>(`/action/one?id=${id}`);
    }

    async updateAction(
        id: string,
        data: {
            description?: string;
            rolesToConnect?: string[];
            rolesToDisconnect?: string[];
        }
    ): Promise<ApiResponse> {
        return this.request(`/action/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    // User methods
    async getUsers(
        params: {
            pageNumber?: number;
            pageSize?: number;
            search?: string;
            roleNames?: string[];
            pagination?: boolean;
            phone?: string;
        } = {}
    ): Promise<ApiResponse<UserListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.phone) searchParams.append("phone", params.phone);
        if (params.roleNames && params.roleNames.length > 0) {
            params.roleNames.forEach((role) =>
                searchParams.append("roleNames", role)
            );
        }
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<UserListResponse>(`/user/many?${searchParams}`);
    }

    async getUser(id: string): Promise<ApiResponse<User>> {
        return this.request<User>(`/user/one?id=${id}`);
    }

    async createUser(data: {
        phone: string;
        fullname: string;
        password: string;
        rolesToConnect: string[];
        actionsToConnect?: string[];
        source?: string;
        storehouseId?: string;
    }): Promise<ApiResponse> {
        return this.request("/user/one", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateUser(
        id: string,
        data: {
            phone?: string;
            fullname?: string;
            password?: string;
            rolesToConnect?: string[];
            rolesToDisconnect?: string[];
            actionsToConnect?: string[];
            actionsToDisconnect?: string[];
            source?: string;
            storehouseId?: string;
        }
    ): Promise<ApiResponse> {
        return this.request(`/user/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteUser(id: string): Promise<ApiResponse> {
        return this.request(`/user/one?id=${id}`, {
            method: "DELETE",
        });
    }

    // Furniture Type methods
    async getFurnitureTypes(
        params: {
            pageNumber?: number;
            pageSize?: number;
            search?: string;
            pagination?: boolean;
            name?: string;
        } = {}
    ): Promise<ApiResponse<FurnitureTypeListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<FurnitureTypeListResponse>(
            `/furniture-type/many?${searchParams}`
        );
    }

    async createFurnitureType(data: { name: string }): Promise<ApiResponse> {
        return this.request("/furniture-type/one", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateFurnitureType(
        id: string,
        data: { name: string }
    ): Promise<ApiResponse> {
        return this.request(`/furniture-type/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteFurnitureType(id: string): Promise<ApiResponse> {
        return this.request(`/furniture-type/one?id=${id}`, {
            method: "DELETE",
        });
    }

    // Model methods
    async getModels(
        params: {
            pageNumber?: number;
            pageSize?: number;
            name?: string;
            pagination?: boolean;
        } = {}
    ): Promise<ApiResponse<ModelListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.name) searchParams.append("search", params.name);
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<ModelListResponse>(`/model/many?${searchParams}`);
    }

    async createModel(data: {
        name: string;
        furnitureTypeId: string;
        providerId: string;
    }): Promise<ApiResponse> {
        return this.request("/model/one", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateModel(
        id: string,
        data: {
            name: string;
            furnitureTypeId: string;
            providerId: string;
        }
    ): Promise<ApiResponse> {
        return this.request(`/model/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteModel(id: string): Promise<ApiResponse> {
        return this.request(`/model/one?id=${id}`, {
            method: "DELETE",
        });
    }

    //product
    async getProducts(
        params: {
            pageNumber?: number;
            pageSize?: number;
            search?: string;
            pagination?: boolean;
        } = {}
    ): Promise<ApiResponse<ProductListResponse>> {
        const searchParams = new URLSearchParams();

        if (params.pageNumber)
            searchParams.append("pageNumber", params.pageNumber.toString());
        if (params.pageSize)
            searchParams.append("pageSize", params.pageSize.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.pagination !== undefined) {
            searchParams.append("pagination", params.pagination.toString());
        } else {
            searchParams.append("pagination", "true");
        }

        return this.request<ProductListResponse>(
            `/product/many?${searchParams}`
        );
    }

    async createProduct(data: {
        publicId: string;
        modelId: string;
        tissue: string;
        quantity: number;
        direction: "left" | "right" | "none";
        description: string;
        type: "standart" | "nonstandart";
    }): Promise<ApiResponse> {
        return this.request("/product/one", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateProduct(
        id: string,
        data: {
            publicId: string;
            modelId: string;
            tissue: string;
            quantity: number;
            direction: "left" | "right" | "none";
            description: string;
            type: "standart" | "nonstandart";
        }
    ): Promise<ApiResponse> {
        return this.request(`/product/one?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteProduct(id: string): Promise<ApiResponse> {
        return this.request(`/product/one?id=${id}`, {
            method: "DELETE",
        });
    }

    async generatePublicId(): Promise<ApiResponse> {
        return this.request("/public-id/generate", { method: "GET" });
    }
}

export const apiService = new ApiService();
export type {
    Storehouse,
    ApiResponse,
    Role,
    Action,
    User,
    FurnitureType,
    Model,
    Product,
};
