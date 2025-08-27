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

  console.log('Sending request with data:', {
    schoolYear,
    semester,
    registrationDate,
  }); // Debug log

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
    // Ambil detail error dari response
    const errorData = await res.json().catch(() => ({}));
    console.error('API Error Response:', errorData); // Debug log

    // Buat error yang lebih informatif
    const error = new Error('Failed to start registration');
    error.response = res;
    error.data = errorData;
    throw error;
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

  console.log('Submitting form with draft ID:', draftId);
  console.log('Form data being sent:', formData);

  try {
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

    console.log('Response status:', res.status);
    console.log('Response headers:', res.headers);

    if (!res.ok) {
      // Coba ambil response body
      let errorData = {};
      try {
        errorData = await res.json();
        console.error('Backend Error Response:', errorData);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { message: 'Failed to parse error response' };
      }

      console.error('HTTP Status:', res.status);
      console.error('Response URL:', res.url);

      // Buat error yang lebih informatif
      const error = new Error('Failed to submit registration form');
      error.response = res;
      error.data = errorData;
      error.status = res.status;
      throw error;
    }

    const responseData = await res.json();
    console.log('Success response:', responseData);
    return responseData;
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    throw fetchError;
  }
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

export const getRegistrationPreview = async (applicationId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `http://localhost:8000/api/registration/preview/${applicationId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch registration preview');
  }

  return await res.json();
};