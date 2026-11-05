export const getApiUrl = (endpoint: string): string => {
  const baseUrl = (
    import.meta.env.VITE_API_URL || '/api'
  ).replace(/\/+$/, '')

  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`

  return `${baseUrl}${cleanEndpoint}`
}