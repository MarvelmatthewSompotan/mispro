export const login = async (email, password) => {
  const res = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Login gagal');
  }

  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const getMe = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/api/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user data');
  }

  return await res.json();
};

export const getRegistrationOptions = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/api/registration-option', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch registration option');
  }

  return await res.json();
};

export const startRegistration = async (
  schoolYear,
  semester,
  registrationDate
) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/api/registration/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      school_year_id: schoolYear,
      semester_id: semester,
      registration_date: registrationDate,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to start registration');
  }

  return await res.json();
};

export const logout = async () => {
  const token = localStorage.getItem('token');
  await fetch('http://localhost:8000/api/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  localStorage.removeItem('token');
};

export const submitRegistrationForm = async (draftId, formData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `http://localhost:8000/api/registration/store/${draftId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    }
  );

  if (!res.ok) {
    throw new Error('Failed to submit registration form');
  }

  return await res.json();
};

export const searchStudent = async (searchTerm) => {
  const token = localStorage.getItem('token');
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
    throw new Error('Failed to search student');
  }

  return await res.json();
};

export const getStudentLatestApplication = async (studentId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `http://localhost:8000/api/students/${studentId}/latest-application`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to get latest application data');
  }

  return await res.json();
};
