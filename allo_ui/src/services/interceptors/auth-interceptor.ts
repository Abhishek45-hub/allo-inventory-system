import { endpoints } from "@/services/endpoints";
import { useAuthStore } from "@/store/auth-store";
import type {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from "axios";

let refreshing: Promise<string | null> | null = null;
const clearAccessCookie = () => {
	document.cookie = "access_token=; path=/; max-age=0; samesite=lax";
};

const setAccessCookie = (token: string) => {
	document.cookie = `access_token=${token}; path=/; max-age=${60 * 15}; samesite=lax`;
};

export const setupAuthInterceptors = (client: AxiosInstance): void => {
	client.interceptors.request.use((config) => {
		const token = useAuthStore.getState().accessToken;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	client.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const request = error.config as
				| (InternalAxiosRequestConfig & { _retry?: boolean })
				| undefined;
			if (!request || error.response?.status !== 401 || request._retry) {
				return Promise.reject(error);
			}
			request._retry = true;

			const refreshToken = useAuthStore.getState().refreshToken;
			if (!refreshToken) {
				useAuthStore.getState().clear();
				clearAccessCookie();
				return Promise.reject(error);
			}

			if (!refreshing) {
				refreshing = client
					.post(endpoints.refresh, { refreshToken })
					.then((response) => {
						const accessToken = response.data?.data?.accessToken as string;
						const nextRefresh = response.data?.data?.refreshToken as string;
						const user = useAuthStore.getState().user;
						if (!accessToken || !nextRefresh || !user) {
							clearAccessCookie();
							return null;
						}
						useAuthStore
							.getState()
							.setSession({ accessToken, refreshToken: nextRefresh, user });
						setAccessCookie(accessToken);
						return accessToken;
					})
					.finally(() => {
						refreshing = null;
					});
			}

			const newToken = await refreshing;
			if (!newToken) {
				useAuthStore.getState().clear();
				clearAccessCookie();
				return Promise.reject(error);
			}

			request.headers.Authorization = `Bearer ${newToken}`;
			return client(request);
		},
	);
};
