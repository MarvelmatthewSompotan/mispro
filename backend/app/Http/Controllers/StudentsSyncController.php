<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentsSyncController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter limit & page
        $limit = (int) $request->input('limit', 100);
        $updatedAfter = $request->input('updated_after'); // Opsional: untuk Incremental Sync

        // 2. Query ke Database dengan Eager Loading
        $query = Student::with(['schoolClass', 'schoolYears']);

        // Filter incremental sync jika Go mengirimkan timestamp sync terakhir
        if ($updatedAfter) {
            $query->where('updated_at', '>=', $updatedAfter);
        }

        $paginated = $query->orderBy('id', 'asc')->paginate($limit);

        // 3. Format Response sesuai kebutuhan Go Backend
        $formattedData = $paginated->getCollection()->map(function ($student) {
            $latestClass = $student->schoolClass->last();
            $latestSchoolYear = $student->schoolYears->last();

            $gradeVal = $latestClass?->grade ?? '';
            $schoolYearName = $latestSchoolYear?->name ?? $latestSchoolYear?->year ?? '';

            // Format tanggal lahir dari kolom date_of_birth menjadi YYYY-MM-DD
            $birthDateFormatted = $student->date_of_birth 
                ? Carbon::parse($student->date_of_birth)->format('Y-m-d') 
                : '';

            // Gabungkan Nama Lengkap untuk Go Backend
            $fullName = trim(implode(' ', array_filter([
                $student->first_name,
                $student->middle_name,
                $student->last_name
            ])));

            return [
                'nis'           => $student->student_id,
                'nisn'          => $student->nisn ?? '', // <-- Field NISN ditambahkan di sini
                'full_name'     => $fullName ?: ($student->full_name ?? ''),
                'first_name'    => $student->first_name,
                'middle_name'   => $student->middle_name,
                'last_name'     => $student->last_name,
                'photo_uri'     => 'https://student_portal.manadoindependent.sch.id/storage/' . $student->photo_path,
                'birth_date'    => $birthDateFormatted,
                'class_id'      => 0,
                'school_year'   => $schoolYearName,
                'academic_year' => $gradeVal ? 'Grade ' . $gradeVal : '',
                'is_active'     => (bool) ($student->active ?? $student->status),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedData,
            'meta'   => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ], 200);
    }
}