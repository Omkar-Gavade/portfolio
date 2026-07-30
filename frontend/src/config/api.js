// export const API_BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:8080"
//     : "https://portfolio-backend-5s1x.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "/api";