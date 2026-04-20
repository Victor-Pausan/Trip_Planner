import axios from "axios"
import { ACCESS_TOKEN } from "./constants"
import { REFRESH_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

// ─── Response interceptor ─────────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []  // holds requests that came in while a refresh is in progress

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token)
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        // Queue subsequent requests while a refresh is already in flight
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                })
                .catch(Promise.reject)
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN)
            const { data } = await axios.post(          // plain axios — not `api`
                `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                { refresh: refreshToken }
            )

            const newAccessToken = data.access
            localStorage.setItem(ACCESS_TOKEN, newAccessToken)

            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
            originalRequest.headers.Authorization    = `Bearer ${newAccessToken}`

            processQueue(null, newAccessToken)
            return api(originalRequest)             // retry original request

        } catch (refreshError) {
            processQueue(refreshError, null)
            localStorage.removeItem(ACCESS_TOKEN)   // force logout
            localStorage.removeItem(REFRESH_TOKEN)
            window.location.href = "/login"         // redirect
            return Promise.reject(refreshError)

        } finally {
            isRefreshing = false
        }
    }
)


export default api