const API_BASE_URL = "http://localhost:8000/api";

// Helper function untuk mendapatkan token dari localStorage
const getToken = () => {
  return localStorage.getItem("auth_token");
};

// Helper function untuk membuat headers dengan token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Helper function untuk handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    // Handle non-JSON responses (like HTML error pages)
    const text = await response.text();
    throw new Error(
      `Server error: ${response.status} - ${text.substring(0, 100)}`
    );
  }
};

// API service class
class ApiService {
  // Auth endpoints
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await handleResponse(response);
        return {
          success: false,
          message:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await handleResponse(response);

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Login failed. Please try again.",
      };
    }
  }

  static async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);

      if (data.success) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  static async getMe() {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get me error:", error);
      throw error;
    }
  }

  // Registration endpoints
  static async startRegistration(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/registration/start`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Start registration error:", error);
      throw error;
    }
  }

  static async getRegistrationOptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/registration-option`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);

      // Endpoint ini tidak menggunakan success wrapper, langsung return data
      return data;
    } catch (error) {
      console.error("Get registration options error:", error);
      throw error;
    }
  }

  static async searchStudents(searchTerm) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/search?search=${encodeURIComponent(
          searchTerm
        )}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Search students error:", error);
      throw error;
    }
  }

  static async getLatestApplication(studentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/${studentId}/latest-application`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Get latest application error:", error);
      throw error;
    }
  }

  static async storeRegistration(draftId, formData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/registration/store/${draftId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Store registration error:", error);
      throw error;
    }
  }
}

export default ApiService;
