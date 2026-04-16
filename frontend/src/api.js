import axios from "axios";

// Change this to test roles: admin | commander | logistics
const ROLE = "admin";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    role: ROLE,
  },
});

export default api;