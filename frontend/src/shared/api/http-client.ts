import axios from "axios"

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

httpClient.interceptors.request.use((config) => {
  config.headers.set("X-Client", "relay-web")
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401)
      window.dispatchEvent(new Event("relay:session-expired"))
    return Promise.reject(error)
  }
)
