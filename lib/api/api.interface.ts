export interface ApiResponse<T = any> {
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
