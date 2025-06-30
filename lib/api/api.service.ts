import { ApiResponse } from "./api.interface";

const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:5000";

class ApiService {
    async request<T>(
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
}

export const apiService = new ApiService();
