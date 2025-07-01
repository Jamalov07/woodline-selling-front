import { HttpMethod } from "../enums";
import { ApiEndpoints } from "./endpoints";

export const API_ROUTES = {
    AUTH: {
        SIGN_IN: { method: HttpMethod.POST, path: ApiEndpoints.auth.signin },
    },
    USER: {
        CREATE: { method: HttpMethod.POST, path: "/user/one" },
    },
};
