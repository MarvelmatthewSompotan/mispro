<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationFormVersion;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::select(
            'students.student_id',
            DB::raw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name) AS full_name"),
            'enrollments.section_id',
            'enrollments.class_id',
            'enrollments.school_year_id',
            'enrollments.semester_id',
            'students.nisn',
            'students.nik',
            'students.registration_date'
        )
        ->join('enrollments', 'enrollments.student_id', '=', 'students.student_id');
        
        // Filter
        if ($request->filled('school_year_id')) {
            $query->where('enrollments.school_year_id', $request->input('school_year_id'));
        }
        if ($request->filled('semester_id')) {
            $query->where('enrollments.semester_id', $request->input('semester_id'));
        }
        if ($request->filled('section_id')) {
            $sectionIds = $request->input('section_id');
            if (is_array($sectionIds)) {
                $query->whereIn('enrollments.section_id', $sectionIds);
            } else {
                $query->where('enrollments.section_id', $sectionIds);
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('students.student_id', 'like', "%$search%")
                ->orWhere(DB::raw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)"), 'like', "%$search%");
            });
        }
        
        $students= $query
            ->orderBy('students.registration_date', 'desc')
            ->get()
            ->unique(function ($item) {
                return $item->nisn . '|' . $item->nik;
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    public function searchStudents(Request $request)
    {
        $keyword = $request->input('search');
        if (!$keyword) {
            return response()->json([]);
        }

        $students = Student::select(
                'student_id',
                DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name"),
                'nisn',
                'nik',
                'registration_date'
            )
            ->where(function ($query) use ($keyword) {
                $query->where('student_id', 'like', "%$keyword%")
                    ->orWhere('first_name', 'like', "%$keyword%")
                    ->orWhere('middle_name', 'like', "%$keyword%")
                    ->orWhere('last_name', 'like', "%$keyword%")
                    ->orWhere(DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name)"), 'like', "%$keyword%");
            })
            ->orderBy('registration_date', 'desc') 
            ->limit(50) 
            ->get()
            ->unique(function ($item) {
                return $item->nisn . '|' . $item->nik;
            })
            ->values()
            ->take(10); 

        return response()->json($students);
    }


    public function getLatestApplication($student_id)
    {
        $latestVersion = ApplicationFormVersion::with(['applicationForm.enrollment.student'])
            ->whereHas('applicationForm.enrollment.student', function ($q) use ($student_id) {
                $q->where('student_id', $student_id);
            })
            ->orderByDesc('updated_at')
            ->first();

        if (!$latestVersion) {
            return response()->json([
                'success' => false,
                'error' => 'No application found for this student',
            ], 404);
        }

        $dataSnapshot = $latestVersion->data_snapshot ? json_decode($latestVersion->data_snapshot, true) : [];
        
        // Extract request_data dari snapshot
        $requestData = $dataSnapshot['request_data'] ?? [];
        
        // Mapping data sesuai dengan struktur yang diharapkan frontend
        $formattedData = [
            'studentInfo' => [
                'first_name' => $requestData['first_name'] ?? '',
                'middle_name' => $requestData['middle_name'] ?? '',
                'last_name' => $requestData['last_name'] ?? '',
                'nickname' => $requestData['nickname'] ?? '',
                'citizenship' => $requestData['citizenship'] ?? '',
                'country' => $requestData['country'] ?? '',
                'religion' => $requestData['religion'] ?? '',
                'place_of_birth' => $requestData['place_of_birth'] ?? '',
                'date_of_birth' => $requestData['date_of_birth'] ?? '',
                'email' => $requestData['email'] ?? '',
                'phone_number' => $requestData['phone_number'] ?? '',
                'previous_school' => $requestData['previous_school'] ?? '',
                'academic_status' => $requestData['academic_status'] ?? '',
                'academic_status_other' => $requestData['academic_status_other'] ?? '',
                'gender' => $requestData['gender'] ?? '',
                'family_rank' => $requestData['family_rank'] ?? '',
                'nisn' => $requestData['nisn'] ?? '',
                'nik' => $requestData['nik'] ?? '',
                'kitas' => $requestData['kitas'] ?? '',
                'street' => $requestData['street'] ?? '',
                'rt' => $requestData['rt'] ?? '',
                'rw' => $requestData['rw'] ?? '',
                'village' => $requestData['village'] ?? '',
                'district' => $requestData['district'] ?? '',
                'city_regency' => $requestData['city_regency'] ?? '',
                'province' => $requestData['province'] ?? '',
                'other' => $requestData['other'] ?? '',
            ],
            'program' => [
                'section_id' => $requestData['section_id'] ?? '',
                'program_id' => $requestData['program_id'] ?? '',
                'class_id' => $requestData['class_id'] ?? '',
                'major_id' => $requestData['major_id'] ?? '',
                'program_other' => $requestData['program_other'] ?? '',
            ],
            'facilities' => [
                'transportation_id' => $requestData['transportation_id'] ?? '',
                'pickup_point_id' => $requestData['pickup_point_id'] ?? '',
                'pickup_point_custom' => $requestData['pickup_point_custom'] ?? '',
                'transportation_policy' => $requestData['transportation_policy'] ?? '',
                'residence_id' => $requestData['residence_id'] ?? '',
                'residence_hall_policy' => $requestData['residence_hall_policy'] ?? '',
            ],
            'parentGuardian' => [
                'father_name' => $requestData['father_name'] ?? '',
                'father_company' => $requestData['father_company'] ?? '',
                'father_occupation' => $requestData['father_occupation'] ?? '',
                'father_phone' => $requestData['father_phone'] ?? '',
                'father_email' => $requestData['father_email'] ?? '',
                'father_address_street' => $requestData['father_address_street'] ?? '',
                'father_address_rt' => $requestData['father_address_rt'] ?? '',
                'father_address_rw' => $requestData['father_address_rw'] ?? '',
                'father_address_village' => $requestData['father_address_village'] ?? '',
                'father_address_district' => $requestData['father_address_district'] ?? '',
                'father_address_city_regency' => $requestData['father_address_city_regency'] ?? '',
                'father_address_province' => $requestData['father_address_province'] ?? '',
                'father_address_other' => $requestData['father_address_other'] ?? '',
                'father_company_addresses' => $requestData['father_company_addresses'] ?? '',
                'mother_name' => $requestData['mother_name'] ?? '',
                'mother_company' => $requestData['mother_company'] ?? '',
                'mother_occupation' => $requestData['mother_occupation'] ?? '',
                'mother_phone' => $requestData['mother_phone'] ?? '',
                'mother_email' => $requestData['mother_email'] ?? '',
                'mother_address_street' => $requestData['mother_address_street'] ?? '',
                'mother_address_rt' => $requestData['mother_address_rt'] ?? '',
                'mother_address_rw' => $requestData['mother_address_rw'] ?? '',
                'mother_address_village' => $requestData['mother_address_village'] ?? '',
                'mother_address_district' => $requestData['mother_address_district'] ?? '',
                'mother_address_city_regency' => $requestData['mother_address_city_regency'] ?? '',
                'mother_address_province' => $requestData['mother_address_province'] ?? '',
                'mother_address_other' => $requestData['mother_address_other'] ?? '',
                'mother_company_addresses' => $requestData['mother_company_addresses'] ?? '',
                'guardian_name' => $requestData['guardian_name'] ?? '',
                'relation_to_student' => $requestData['relation_to_student'] ?? '',
                'guardian_phone' => $requestData['guardian_phone'] ?? '',
                'guardian_email' => $requestData['guardian_email'] ?? '',
                'guardian_address_street' => $requestData['guardian_address_street'] ?? '',
                'guardian_address_rt' => $requestData['guardian_address_rt'] ?? '',
                'guardian_address_rw' => $requestData['guardian_address_rw'] ?? '',
                'guardian_address_village' => $requestData['guardian_address_village'] ?? '',
                'guardian_address_district' => $requestData['guardian_address_district'] ?? '',
                'guardian_address_city_regency' => $requestData['guardian_address_city_regency'] ?? '',
                'guardian_address_province' => $requestData['guardian_address_province'] ?? '',
                'guardian_address_other' => $requestData['guardian_address_other'] ?? '',
            ],
            'termOfPayment' => [
                'tuition_fees' => $requestData['tuition_fees'] ?? '',
                'residence_payment' => $requestData['residence_payment'] ?? '',
                'financial_policy_contract' => $requestData['financial_policy_contract'] ?? '',
                'discount_name' => $requestData['discount_name'] ?? '',
                'discount_notes' => $requestData['discount_notes'] ?? '',
            ],
            'student_status' => 'Old',
            'input_name' => $student_id
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'student' => $latestVersion->applicationForm->enrollment->student ?? null,
        ]);
    }

    public function updateStudent(Request $request, $student_id)
    {
        $latestVersion = ApplicationFormVersion::with('applicationForm.enrollment.student')
            ->whereHas('applicationForm.enrollment.student', function ($q) use ($student_id) {
                $q->where('student_id', $student_id);
            })
            ->orderByDesc('updated_at')
            ->first();

        if (!$latestVersion) {
            return response()->json([
                'success' => false,
                'error' => 'No application found for this student',
            ], 404);
        }

        $oldSnapshot = $latestVersion->data_snapshot ? json_decode($latestVersion->data_snapshot, true) : [];
        $oldRequestData = $oldSnapshot['request_data'] ?? [];

        $newRequestData = array_merge($oldRequestData, $request->all());

        $newSnapshot = [
            'request_data' => $newRequestData,
        ];

        $maxVersion = ApplicationFormVersion::whereHas('applicationForm.enrollment', function($query) use ($student) {
            $query->where('student_id', $student_id);
        })->max('version');
        
        $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
        $userName = auth()->user()->name;

        $newVersion = ApplicationFormVersion::create([
            'application_id' => $latestVersion->application_id,
            'version' => $nextVersion,
            'updated_by' => $userName,
            'data_snapshot' => json_encode($newSnapshot, JSON_PRETTY_PRINT),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student application updated successfully',
            'version_id' => $newVersion->version_id,
            'data' => $newSnapshot,
        ]);

    }
}
