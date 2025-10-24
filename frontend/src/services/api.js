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
    Accept: 'application/json',
    ...options.headers,
  };

  // Jangan set Content-Type jika body adalah FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Jika butuh auth tapi token tidak ada, langsung gagalkan
      console.error('No token found for authenticated request');
      // Arahkan ke login
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication token is missing.'));
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Cek jika status 401 (Unauthorized / Token Expired)
  if (res.status === 401 && requiresAuth) {
    console.error('Token is expired or invalid. Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
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
    '/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false
  );
  // Simpan token setelah login berhasil
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const logout = async () => {
  try {
    // Endpoint logout tetap butuh token untuk tahu sesi mana yang harus dihapus di backend
    await apiFetch('/logout', { method: 'POST' });
  } catch (error) {
    // Abaikan error saat logout (misal: token sudah expired), yang penting data di local storage bersih
    console.warn(
      'Logout failed on server, proceeding to clear local data.',
      error
    );
  } finally {
    localStorage.removeItem('token');
  }
};

export const getMe = () => apiFetch('/me');

export const getRegistrationOptions = () => apiFetch('/registration-option');

/**
 * Menambahkan school year baru ke database.
 * Backend akan otomatis meng-increment tahun ajaran terakhir.
 * @returns {Promise<any>} - Data dari response API, termasuk school year yang baru dibuat.
 */
export const addSchoolYear = () => {
  // Mengirim body kosong karena backend yang akan menangani logika increment
  return apiFetch('/school-year/add', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const startRegistration = (schoolYear, semester, registrationDate) => {
  return apiFetch('/registration/start', {
    method: 'POST',
    body: JSON.stringify({
      school_year_id: schoolYear,
      semester_id: semester,
      registration_date: registrationDate,
    }),
  });
};

export const submitRegistrationForm = (draftId, formData) => {
  return apiFetch(`/registration/store/${draftId}`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

export const updateRegistrationStatus = (applicationId, newStatus) => {
  return apiFetch(`/registration/${applicationId}/status`, {
    method: 'PATCH',
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
  params.append('page', filters.page || 1);
  params.append('per_page', filters.per_page || 25);

  // --- Parameter Filter Opsional ---
  if (filters.search) {
    params.append('search', filters.search);
  } else if (filters.search_name) {
    params.append('search_name', filters.search_name);
  }
  if (filters.school_year_id) {
    params.append('school_year_id', filters.school_year_id);
  }

  // Filter Array (contoh: class_id[]=1&class_id[]=2)
  filters.class_id?.forEach((id) => params.append('class_id[]', id));
  filters.section_id?.forEach((id) => params.append('section_id[]', id));
  filters.enrollment_status?.forEach((status) =>
    params.append('enrollment_status[]', status)
  );
  filters.student_status?.forEach((status) =>
    params.append('student_status[]', status)
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
  formData.append('_method', 'PATCH');
  for (const key in studentData) {
    if (Object.prototype.hasOwnProperty.call(studentData, key)) {
      const value = studentData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
  }

  return apiFetch(`/students/${studentId}/update`, {
    method: 'POST',
    body: formData,
  });
};

// api.js
export const getLogbook = ({
  // Search (string)
  search_full_name = '',      // fullname concat & scoped by school_year
  search_father_name = '',
  search_mother_name = '',
  search_religion = '',
  search_country = '',
  search_family_rank = '',

  // Checkbox (array) — kecuali school_year single-select
  grade = [],
  section = [],
  gender = [],
  transportation = [],
  school_year = null,         // single

  // Range
  registration_start_date = '', // 'YYYY-MM-DD'
  registration_end_date = '',
  age_min = '',               // dalam tahun (angka), backend yang hitung
  age_max = '',

  // Sort (array of {field, order})
  sort = [],

  // Pagination (opsional)
  page = 1,
  per_page = 25,
} = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('per_page', per_page);

  // Search
  if (search_full_name) params.append('search_full_name', search_full_name);
  if (search_religion) params.append('search_religion', search_religion);
  if (search_country) params.append('search_country', search_country);
  if (search_father_name) params.append('search_father_name', search_father_name);
  if (search_mother_name) params.append('search_mother_name', search_mother_name);
  if (search_family_rank) params.append('search_family_rank', search_family_rank);

  // Checkbox arrays
  (Array.isArray(grade) ? grade : []).forEach(v => params.append('grade[]', v));
  (Array.isArray(section) ? section : []).forEach(v => params.append('section[]', v));
  (Array.isArray(gender) ? gender : []).forEach(v => params.append('gender[]', v));
  (Array.isArray(transportation) ? transportation : []).forEach(v => params.append('transportation[]', v));
  if (school_year) params.append('school_year', school_year); // single select

  // Date range
  if (registration_start_date) params.append('registration_start_date', registration_start_date);
  if (registration_end_date) params.append('registration_end_date', registration_end_date);

  // Age range
  if (age_min !== '' && age_min !== null) params.append('age_min', age_min);
  if (age_max !== '' && age_max !== null) params.append('age_max', age_max);

  // Sort (multi-field)
  sort?.forEach((s, i) => {
    params.append(`sort[${i}][field]`, s.field);
    params.append(`sort[${i}][order]`, s.order); // 'asc' | 'desc'
  });

  return apiFetch(`/logbook?${params.toString()}`);
};


export const getRegistrations = ({
  search = '',
  search_name = '',
  search_id = '', // <-- BARU: Filter ID
  start_date = null, // <-- BARU: Filter Tanggal Awal
  end_date = null, // <-- BARU: Filter Tanggal Akhir
  grade = null, // <-- BARU: Grade
  section = null,
  status = null, // <-- BARU: Status (Confirmed/Cancelled)
  sort = null, // <-- BARU: Sort
  page = 1,
  per_page = 10,
} = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('per_page', per_page);

  // --- Parameter Filter Opsional (String/Date) ---
  // 'search' untuk Student Name (filter bar atas/popup)
  if (search) {
    params.append('search', search);
  } else if (search_name) {
    params.append('search_name', search_name);
  }
  if (search_id) params.append('search_id', search_id);
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  // --- Filter Array (Checkbox) ---
  // Contoh: class_id[]=1&class_id[]=2
  // Untuk Grade
  if (Array.isArray(grade)) {
    grade.forEach((id) => params.append('grade[]', id));
  } else if (grade) {
    params.append('grade[]', grade); // Asumsi grade selalu array dari filter popup
  }

  // Untuk Section
  if (Array.isArray(section)) {
    section.forEach((id) => params.append('section[]', id));
  } else if (section) {
    params.append('section[]', section);
  }

  // Untuk Status
  if (Array.isArray(status)) {
    status.forEach((status) => params.append('status[]', status));
  } else if (status) {
    params.append('status[]', status);
  }

  // --- Parameter Sort Opsional ---
  // (contoh: sort[0][field]=grade&sort[0][order]=asc)
  sort?.forEach((s, index) => {
    params.append(`sort[${index}][field]`, s.field);
    params.append(`sort[${index}][order]`, s.order);
  });

  return apiFetch(`/registration?${params.toString()}`);
};

export const getStudentHistoryDates = (studentId) =>
  apiFetch(`/students/${studentId}/history-dates`);

export const getHistoryDetail = (versionId) =>
  apiFetch(`/students/history/${versionId}`);
