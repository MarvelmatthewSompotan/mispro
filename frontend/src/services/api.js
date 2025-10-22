// src/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Wrapper function untuk fetch API.
 * Fungsi ini secara otomatis menangani:
 * 1. Penambahan Authorization header untuk rute yang memerlukan otentikasi.
 * 2. Pengecekan response. Jika response 401 (Unauthorized), akan otomatis logout.
 * 3. Parsing JSON dari response.
 *
 * @param {string} endpoint - Endpoint API yang akan dipanggil (misal: '/me').
 * @param {object} options - Opsi konfigurasi untuk fetch (method, body, dll).
 * @param {boolean} requiresAuth - Set ke `false` jika request tidak butuh token (misal: login).
 * @returns {Promise<any>} - Data JSON dari response.
 */
const apiFetch = async (endpoint, options = {}, requiresAuth = true) => {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  // Jangan set Content-Type jika body adalah FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Jika butuh auth tapi token tidak ada, langsung gagalkan
      console.error("No token found for authenticated request");
      // Arahkan ke login
      window.location.href = "/login";
      return Promise.reject(new Error("Authentication token is missing."));
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Cek jika status 401 (Unauthorized / Token Expired)
  if (res.status === 401 && requiresAuth) {
    console.error("Token is expired or invalid. Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    // Untuk error selain 401, coba parse body error dari API
    const errorData = await res.json().catch(() => ({})); // default ke objek kosong jika body bukan json
    const error = new Error(`HTTP error! status: ${res.status}`);
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  // Jika response tidak memiliki body (misal: status 204 No Content), kembalikan null
  if (res.status === 204) {
    return null;
  }

  return await res.json();
};

export const login = async (email, password) => {
  // `requiresAuth` diset `false` karena login belum punya token
  const data = await apiFetch(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false
  );
  // Simpan token setelah login berhasil
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

export const logout = async () => {
  try {
    // Endpoint logout tetap butuh token untuk tahu sesi mana yang harus dihapus di backend
    await apiFetch("/logout", { method: "POST" });
  } catch (error) {
    // Abaikan error saat logout (misal: token sudah expired), yang penting data di local storage bersih
    console.warn(
      "Logout failed on server, proceeding to clear local data.",
      error
    );
  } finally {
    localStorage.removeItem("token");
  }
};

export const getMe = () => apiFetch("/me");

export const getRegistrationOptions = () => apiFetch("/registration-option");

/**
 * Menambahkan school year baru ke database.
 * Backend akan otomatis meng-increment tahun ajaran terakhir.
 * @returns {Promise<any>} - Data dari response API, termasuk school year yang baru dibuat.
 */
export const addSchoolYear = () => {
  // Mengirim body kosong karena backend yang akan menangani logika increment
  return apiFetch("/school-year/add", {
    method: "POST",
    body: JSON.stringify({}),
  });
};

export const startRegistration = (schoolYear, semester, registrationDate) => {
  return apiFetch("/registration/start", {
    method: "POST",
    body: JSON.stringify({
      school_year_id: schoolYear,
      semester_id: semester,
      registration_date: registrationDate,
    }),
  });
};

export const submitRegistrationForm = (draftId, formData) => {
  return apiFetch(`/registration/store/${draftId}`, {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

export const updateRegistrationStatus = (applicationId, newStatus) => {
  return apiFetch(`/registration/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: newStatus, // 'Confirmed' atau 'Cancelled'
    }),
  });
};

export const searchStudent = (searchTerm) => {
  return apiFetch(`/students/search?search=${encodeURIComponent(searchTerm)}`);
};

export const getStudentLatestApplication = (studentId, source) => {
  if (!source) {
    return Promise.reject(new Error("Parameter 'source' diperlukan."));
  }
  return apiFetch(`/students/${studentId}/latest-application?source=${source}`);
};

export const getRegistrationPreview = (applicationId, versionId) => {
  return apiFetch(
    `/registration/preview/${applicationId}/version/${versionId}`
  );
};

export const getStudents = (filters = {}) => {
  const params = new URLSearchParams();

  // --- Parameter Wajib (Paginasi) ---
  params.append("page", filters.page || 1);
  params.append("per_page", filters.per_page || 25);

  // --- Parameter Filter Opsional ---
  if (filters.search_name) {
    params.append("search_name", filters.search_name);
  }
  if (filters.school_year_id) {
    params.append("school_year_id", filters.school_year_id);
  }

  // Filter Array (contoh: class_id[]=1&class_id[]=2)
  filters.class_id?.forEach((id) => params.append("class_id[]", id));
  filters.section_id?.forEach((id) => params.append("section_id[]", id));
  filters.enrollment_status?.forEach((status) =>
    params.append("enrollment_status[]", status)
  );
  filters.student_status?.forEach((status) =>
    params.append("student_status[]", status)
  );

  // --- Parameter Sort Opsional ---
  // (contoh: sort[0][field]=grade&sort[0][order]=asc)
  filters.sort?.forEach((s, index) => {
    params.append(`sort[${index}][field]`, s.field);
    params.append(`sort[${index}][order]`, s.order);
  });

  // Diasumsikan API endpoint untuk student list adalah /students
  return apiFetch(`/students?${params.toString()}`);
};

export const updateStudent = (studentId, studentData) => {
  const formData = new FormData();
  formData.append("_method", "PATCH");
  for (const key in studentData) {
    if (Object.prototype.hasOwnProperty.call(studentData, key)) {
      const value = studentData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
  }

  return apiFetch(`/students/${studentId}/update`, {
    method: "POST",
    body: formData,
  });
};

export const getRegistrations = ({
  search = "",
  school_year_id = null,
  semester_id = null,
  section_id = null,
  page = 1,
  per_page = 10,
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (school_year_id) params.append("school_year_id", school_year_id);
  if (semester_id) params.append("semester_id", semester_id);
  if (page) params.append("page", page);
  if (per_page) params.append("per_page", per_page);
  if (Array.isArray(section_id)) {
    section_id.forEach((id) => params.append("section_id[]", id));
  } else if (section_id) {
    params.append("section_id", section_id);
  }
  return apiFetch(`/registration?${params.toString()}`);
};

export const getStudentHistoryDates = (studentId) =>
  apiFetch(`/students/${studentId}/history-dates`);

export const getHistoryDetail = (versionId) =>
  apiFetch(`/students/history/${versionId}`);
