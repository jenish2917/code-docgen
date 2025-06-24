import api from "./api";

const AuthService = {
    // Login and store token in localStorage
    login: async (username, password) => {
        try {
            const response = await api.post("/auth/login/", { username, password });
            if (response.data.access) {
                localStorage.setItem("token", response.data.access);
                localStorage.setItem("refreshToken", response.data.refresh);
                localStorage.setItem("username", username);
                return { success: true };
            }
            return { success: false, message: "Invalid credentials" };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.detail || "Login failed"
            };
        }
    },

    // Register a new user
    register: async (username, email, password) => {
        try {
            const response = await api.post("/auth/register/", {
                username,
                email,
                password
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.detail || "Registration failed",
                errors: error.response?.data || {}
            };
        }
    },

    // Logout and remove token
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem("token");
    },

    // Get current user token
    getToken: () => {
        return localStorage.getItem("token");
    },

    // Get refresh token
    getRefreshToken: () => {
        return localStorage.getItem("refreshToken");
    },

    // Get username
    getUsername: () => {
        return localStorage.getItem("username");
    },
    
    // Get user ID from token
    getUserId: () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        
        try {
            // Extract payload from JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            return payload.user_id || payload.sub || null;
        } catch (error) {
            console.error("Error parsing token:", error);
            return null;
        }
    },

    // Refresh the token
    refreshToken: async () => {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
            return { success: false };
        }

        try {
            const response = await api.post("/auth/refresh/", {
                refresh: refreshToken
            });

            if (response.data.access) {
                localStorage.setItem("token", response.data.access);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            AuthService.logout();
            return { success: false };
        }
    },

    // Check token validity and refresh if needed
    checkTokenValidity: async () => {
        try {
            await api.get("/auth/verify/");
            return true;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token expired, try to refresh
                const refreshResult = await AuthService.refreshToken();
                return refreshResult.success;
            }
            return false;
        }
    }
};

export default AuthService;
