import axios from 'axios'

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

const api = axios.create({
  baseURL: "http://localhost:3000"
})

export default api;