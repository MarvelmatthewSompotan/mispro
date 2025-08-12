# API Integration Documentation

## Overview

Frontend React telah diintegrasikan dengan backend Laravel menggunakan Laravel Sanctum untuk autentikasi. Semua request API menggunakan Bearer token yang disimpan di localStorage.

## File Structure

### Core Files

- `src/services/api.js` - Service untuk semua API calls
- `src/contexts/AuthContext.js` - Context untuk mengelola state autentikasi
- `src/components/ProtectedRoute.js` - Komponen untuk melindungi route yang memerlukan autentikasi

### Updated Components

- `src/App.js` - Menambahkan AuthProvider
- `src/router/AppRouter.js` - Menambahkan ProtectedRoute untuk semua halaman yang memerlukan autentikasi
- `src/components/atoms/loginForm/LoginForm.js` - Menggunakan API service untuk login
- `src/components/pages/PopUpForm.js` - Menggunakan API untuk start registration dan get options
- `src/components/pages/RegistrationForm.js` - Menggunakan API untuk semua operasi registration
- `src/components/pages/registration/StudentInformationSection.js` - Menambahkan fitur search student
- `src/components/pages/registration/FormButtonSection.js` - Menggunakan API untuk submit registration

## API Endpoints

### Authentication

- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)
- `GET /api/me` - Get current user data (requires auth)

### Registration

- `POST /api/registration/start` - Start new registration (requires auth)
- `GET /api/registration-option` - Get all dropdown options (requires auth)
- `POST /api/registration/store/{draft_id}` - Submit registration (requires auth)

### Student Management

- `GET /api/students/search?search={term}` - Search students (requires auth)
- `GET /api/students/{student_id}/latest-application` - Get latest application (requires auth)

## Configuration

### Backend CORS

Backend Laravel sudah dikonfigurasi dengan CORS untuk mengizinkan request dari `http://localhost:3000`.

### Frontend Configuration

1. API base URL: `http://localhost:8000/api`
2. Token disimpan di localStorage dengan key `auth_token`
3. User data disimpan di localStorage dengan key `user`

## Usage

### Login Flow

1. User mengisi form login dengan email dan password
2. Frontend memanggil `POST /api/login`
3. Jika berhasil, token disimpan di localStorage
4. User diarahkan ke halaman home

### Registration Flow

1. User membuat registration baru melalui PopUpForm
2. Frontend memanggil `POST /api/registration/start`
3. Draft ID dikembalikan dan disimpan
4. User mengisi form registration dengan data yang diperlukan
5. Untuk old students, user dapat search dan select student yang sudah ada
6. Form disubmit melalui `POST /api/registration/store/{draft_id}`

### Search Student Flow

1. User memilih student status "old"
2. Input search muncul di StudentInformationSection
3. User mengetik nama atau ID student
4. Frontend memanggil `GET /api/students/search?search={term}`
5. Hasil search ditampilkan dalam dropdown
6. User memilih student
7. Frontend memanggil `GET /api/students/{student_id}/latest-application`
8. Form di-populate dengan data student yang dipilih

## Error Handling

### Authentication Errors

- Token expired: User diarahkan ke halaman login
- Invalid credentials: Error message ditampilkan di form login

### API Errors

- Network errors: Error message ditampilkan
- Validation errors: Error message ditampilkan di field yang relevan
- Server errors: Generic error message ditampilkan

## Security

### Token Management

- Token disimpan di localStorage
- Token dikirim dalam header Authorization: Bearer {token}
- Token dihapus saat logout atau expired

### Protected Routes

- Semua halaman kecuali login dilindungi dengan ProtectedRoute
- Jika user tidak authenticated, diarahkan ke halaman login

## Development Notes

### Running the Application

1. Start backend Laravel: `php artisan serve` (port 8000)
2. Start frontend React: `npm start` (port 3000)
3. Pastikan CORS di backend mengizinkan origin `http://localhost:3000`

### Testing

1. Login dengan credentials yang valid
2. Test semua fitur registration
3. Test search student untuk old students
4. Test submit registration

### Troubleshooting

1. Cek console browser untuk error messages
2. Cek network tab untuk API request/response
3. Pastikan backend Laravel berjalan di port 8000
4. Pastikan token valid dan tidak expired
