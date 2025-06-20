// Debug utility to check authentication status
export const debugAuth = () => {
  const token = localStorage.getItem("token");
  console.log("=== AUTH DEBUG ===");
  console.log("Token exists:", !!token);
  if (token) {
    console.log("Token length:", token.length);
    // Try to decode the token (if it's a JWT)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token payload:", payload);
      console.log("Token expires:", new Date(payload.exp * 1000));
      console.log("Token is expired:", Date.now() > payload.exp * 1000);
    } catch (e) {
      console.log("Token is not a valid JWT");
    }
  }
  console.log("==================");
};
