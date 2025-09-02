export const login = async (email, password) => {
  const res = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login gagal");
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
};

export const getMe = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8000/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  return await res.json();
};

export const getRegistrationOptions = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8000/api/registration-option", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch registration option");
  }

  return await res.json();
};

export const startRegistration = async (
  schoolYear,
  semester,
  registrationDate
) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8000/api/registration/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      school_year_id: schoolYear,
      semester_id: semester,
      registration_date: registrationDate,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to start registration");
  }

  return await res.json();
};

export const logout = async () => {
  const token = localStorage.getItem("token");
  await fetch("http://localhost:8000/api/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  localStorage.removeItem("token");
};

// --- FUNGSI INI TELAH DIPERBARUI ---
export const submitRegistrationForm = async (draftId, formData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8000/api/registration/store/${draftId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    }
  );

  // Jika respons TIDAK sukses (misal: status 422, 500, dll.)
  if (!res.ok) {
    // 1. Ambil body JSON dari respons error untuk mendapatkan detailnya.
    const errorData = await res.json();

    // 2. Buat objek error baru untuk dilempar.
    const error = new Error("Failed to submit registration form");

    // 3. Lampirkan detail respons ke objek error tersebut.
    error.response = {
      data: errorData, // Ini akan berisi { error: "Student already exists..." }
      status: res.status, // Ini akan berisi 422
    };

    // 4. Lempar error yang sudah diperkaya dengan detail.
    throw error;
  }

  // Jika sukses, kembalikan data JSON seperti biasa.
  return await res.json();
};
// --- AKHIR DARI FUNGSI YANG DIPERBARUI ---

export const searchStudent = async (searchTerm) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8000/api/students/search?search=${encodeURIComponent(
      searchTerm
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to search student");
  }

  return await res.json();
};

export const getStudentLatestApplication = async (studentId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8000/api/students/${studentId}/latest-application`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to get latest application data");
  }

  return await res.json();
};

export const getRegistrationPreview = async (applicationId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8000/api/registration/preview/${applicationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch registration preview");
  }

  return await res.json();
};
