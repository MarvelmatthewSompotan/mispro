<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\AuditTrailService;
use Illuminate\Support\Facades\Log;
use App\Models\ApplicationFormVersion;
use App\Models\StudentOld;

class StudentController extends Controller
{
    protected $auditTrail;

    public function __construct(AuditTrailService $auditTrail)
    {
        $this->auditTrail = $auditTrail;
    }

    /**
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $schoolYearStr = ($currentMonth >= 7) 
            ? $currentYear . '/' . ($currentYear + 1)
            : ($currentYear - 1) . '/' . $currentYear;
        
        $schoolYear = SchoolYear::where('year', $schoolYearStr)->first();
        $defaultSchoolYearId = $schoolYear?->school_year_id;

        $targetSchoolYearId = $request->input('school_year_id', $defaultSchoolYearId);


        $latestEnrollments = DB::table('enrollments as e1')
        ->select('e1.student_id', 'e1.enrollment_id')
        ->where('e1.school_year_id', $targetSchoolYearId)
        ->whereRaw('e1.registration_date = (
            SELECT MAX(e2.registration_date)
            FROM enrollments AS e2
            WHERE e2.student_id = e1.student_id
            AND e2.school_year_id = e1.school_year_id
        )');

        $query = Student::select(
            'students.student_id',
            DB::raw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name) AS full_name"),
            'students.photo_path',
            'enrollments.section_id',
            'enrollments.class_id',
            'enrollments.school_year_id',
            'school_years.year as school_year',
            'classes.grade',
            'sections.name as section_name',
            'students.status as student_status',
            'enrollments.status as enrollment_status'
        )
        ->joinSub($latestEnrollments, 'latest_enrollments', function ($join) {
            $join->on('latest_enrollments.student_id', '=', 'students.student_id');
        })
        ->join('enrollments', 'enrollments.enrollment_id', '=', 'latest_enrollments.enrollment_id')
        ->join('application_forms', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
        ->join('school_years', 'enrollments.school_year_id', '=', 'school_years.school_year_id')
        ->leftJoin('classes', 'enrollments.class_id', '=', 'classes.class_id')
        ->leftJoin('sections', 'enrollments.section_id', '=', 'sections.section_id');
        
        $query->where('application_forms.status', 'Confirmed');
        
        $isStudentStatusFiltered = $request->filled('student_status');
        $isEnrollmentStatusFiltered = $request->filled('enrollment_status');

        if (!$isStudentStatusFiltered && !$isEnrollmentStatusFiltered) {
            $query->where('students.active', 'YES');
        }

        // Filter Search
        if ($request->filled('search_name')) {
            $searchName = $request->input('search_name');
            $query->where(DB::raw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)"), 'like', "%$searchName%");
        }

        // Filter checkbox
        if ($request->filled('class_id')) {
            $classIds = (array) $request->input('class_id');
            $query->whereIn('enrollments.class_id', $classIds);
        }
        if ($request->filled('section_id')) {
            $sectionIds = (array) $request->input('section_id');
            $query->whereIn('enrollments.section_id', $sectionIds);
        }
        if ($isEnrollmentStatusFiltered) {
            $enrollmentStatuses = (array) $request->input('enrollment_status');
            $query->whereIn('enrollments.status', $enrollmentStatuses);
        }
        if ($isStudentStatusFiltered) {
            $studentStatuses = (array) $request->input('student_status');
            $query->whereIn('students.status', $studentStatuses);
        }
        
        // Sort
        $sorts = $request->input('sort', []);

        $sortable = [
            'student_id' => 'students.student_id',
            'full_name' => "CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)", // DIUBAH MENJADI STRING
            'grade' => 'classes.grade',
            'section' => 'sections.name',
            'enrollment_status' => 'enrollments.status',
            'student_status' => 'students.status',
        ];
        
        if (empty($sorts)) {
            $query->orderBy('students.student_id', 'asc');
        } else {
            foreach ($sorts as $sort) {
                $field = $sort['field'] ?? null;
                $order = strtolower($sort['order'] ?? 'asc');

                if (!$field || !array_key_exists($field, $sortable)) continue;

                if ($field === 'full_name') {
                    $query->orderByRaw($sortable[$field] . ' ' . $order);
                } else {
                    $query->orderBy($sortable[$field], $order);
                }
            }
        }

        // Pagination
        $perPage = $request->input('per_page', 25);
        $students= $query->paginate($perPage);

        // Transform data (photo_url)
        $students->getCollection()->transform(function ($student) {

            $photoUrl = null;
            try {
                $latestApplicationFormVersion = DB::table('application_forms AS af')
                    ->join('enrollments AS e', 'af.enrollment_id', '=', 'e.enrollment_id')
                    ->join('application_form_versions AS afv', 'af.application_id', '=', 'afv.application_id')
                    ->where('e.student_id', $student->student_id)
                    ->select('afv.data_snapshot')
                    ->orderByDesc('afv.version_id')
                    ->first();

                if ($latestApplicationFormVersion && $latestApplicationFormVersion->data_snapshot) {
                    $decode = json_decode($latestApplicationFormVersion->data_snapshot);
                    $photoUrl = $decode->request_data->photo_url ?? null;
                } 
            } catch (\Exception $e) {
            }

            $student->photo_url = $photoUrl;

            return $student;
        });
        
        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    public function searchStudents(Request $request)
    {
        $keyword = $request->input('search');
        if (!$keyword) {
            return response()->json(['new' => [], 'old' => []]);
        }

        // new database
        $students = Student::select(
                'student_id',
                DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name"),
                'nisn',
                'nik',
                'registration_date',
                DB::raw("'new' as source")
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
            
            // old database
            $studentOld = StudentOld::select(
                    DB::raw('studentold_id as student_id'),
                    DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name"),
                    'nisn',
                    'nik',
                    DB::raw('NULL as registration_date'),
                    'section_id',
                    DB::raw("'old' as source")
                )
                ->where(function ($query) use ($keyword) {
                    $query->where('studentold_id', 'like', "%$keyword%")
                        ->orWhere('first_name', 'like', "%$keyword%")
                        ->orWhere('middle_name', 'like', "%$keyword%")
                        ->orWhere('last_name', 'like', "%$keyword%")
                        ->orWhere(DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name)"), 'like', "%$keyword%");
                })
                ->orderByDesc('section_id')
                ->limit(50)
                ->get();

        $response = [
            'new' => $students->map(function ($item) {
                return [
                    'student_id' => $item->student_id,
                    'full_name' => $item->full_name,
                    'nisn' => $item->nisn,
                    'nik' => $item->nik,
                    'registration_date' => $item->registration_date,
                    'source' => 'new'
                ];
            })->values(),

            'old' => $studentOld->map(function ($item) {
                return [
                    'student_id' => $item->student_id,
                    'full_name' => $item->full_name,
                    'nisn' => $item->nisn,
                    'nik' => $item->nik,
                    'section_id' => $item->section_id,
                    'source' => 'old'
                ];
            })->values(),
        ];

        return response()->json($response);
    }

    public function getLatestApplication($student_id, Request $request)
    {
        $source = $request->input('source', 'new');
        
        if ($source === 'old') {
            $student = StudentOld::where('studentold_id', $student_id)
                ->orderByDesc('section_id')
                ->first();

            if (!$student) {
                return response()->json(
                    [
                        'success' => false,
                        'error' => 'No old student found with this ID',
                    ], 404
                );
            }

            $formattedData = [
                'studentInfo' => [
                    'first_name' => $student->first_name ?? '',
                    'middle_name' => $student->middle_name ?? '',
                    'last_name' => $student->last_name ?? '',
                    'nickname' => $student->nickname ?? '',
                    'religion' => $student->religion ?? '',
                    'place_of_birth' => $student->place_of_birth ?? '',
                    'date_of_birth' => $student->date_of_birth ?? '',
                    'email' => $student->student_email ?? '',
                    'phone_number' => $student->student_phone ?? '',
                    'previous_school' => $student->previous_school ?? '',
                    'gender' => $student->gender ?? '',
                    'nisn' => $student->nisn ?? '',
                    'nik' => $student->nik ?? '',
                    'street' => $student->student_address ?? '',
                ],
                'program' => [
                    'section_id' => $student->section_id ?? '',
                    'class_id' => $student->class_id ?? '',
                ],
                'parentGuardian' => [
                    'father_name' => $student->father_name ?? '',
                    'father_company' => $student->father_company ?? '',
                    'father_occupation' => $student->father_occupation ?? '',
                    'father_phone' => $student->father_phone ?? '',
                    'father_email' => $student->father_email ?? '',
                    'father_address_street' => $student->father_address ?? '',
                    'mother_name' => $student->mother_name ?? '',
                    'mother_company' => $student->mother_company ?? '',
                    'mother_occupation' => $student->mother_occupation ?? '',
                    'mother_phone' => $student->mother_phone ?? '',
                    'mother_email' => $student->mother_email ?? '',
                    'mother_address_street' => $student->mother_address ?? '',
                    'guardian_name' => $student->guardian_name ?? '',
                    'relation_to_student' => $student->relation_to_student ?? '',
                    'guardian_phone' => $student->guardian_phone ?? '',
                    'guardian_address_street' => $student->guardian_address ?? '',
                ],
                'student_status' => 'Old',
                'input_name' => $student->studentold_id
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedData
            ]);
        }

        $latestVersion = ApplicationFormVersion::with(['applicationForm.enrollment.student'])
            ->whereHas('applicationForm.enrollment.student', function ($q) use ($student_id) {
                $q->where('student_id', $student_id);
            })
            ->orderByDesc('version_id')
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
                'photo_url' => $requestData['photo_url'] ?? '',
                'student_active' => $requestData['student_active'] ?? '',
                'status' => $requestData['status'] ?? '',
            ],
            'program' => [
                'section_id' => $requestData['section_id'] ?? '',
                'program_id' => $requestData['program_id'] ?? '',
                'class_id' => $requestData['class_id'] ?? '',
                'major_id' => $requestData['major_id'] ?? '',
                'program_other' => $requestData['program_other'] ?? '',
                'school_year_id' => $requestData['school_year_id'] ?? '',
                'school_year' => $requestData['school_year'] ?? '', 
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
            'enrollment_status' => $requestData['enrollment_status'] ?? '',
            'application_form_status' => $requestData['application_form_status'] ?? '',
            'student_status' => 'Old',
            'input_name' => $student_id
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedData,
        ]);
    }

    public function updateStudent(Request $request, $student_id)
    {
        DB::beginTransaction();
        try {
             // --- Ambil versi terakhir untuk student ini ---
            $latestVersion = ApplicationFormVersion::with('applicationForm.enrollment.student')
                ->whereHas('applicationForm.enrollment.student', function ($q) use ($student_id) {
                    $q->where('student_id', $student_id);
                })
                ->orderByDesc('version_id')
                ->first();

            if (!$latestVersion) {
                return response()->json([
                    'success' => false,
                    'error' => 'No application found for this student',
                ], 404);
            }

            $student = Student::with(['studentAddress', 'studentParent', 'studentGuardian', 'enrollments'])
                ->findOrFail($student_id);

            // --- Validasi input ---
            $validated = $request->validate([
                // Student
                'first_name'   => 'sometimes|string',
                'middle_name'  => 'sometimes|nullable|string',
                'last_name'    => 'sometimes|string',
                'nickname'     => 'sometimes|nullable|string',
                'citizenship' => 'sometimes|nullable',
                'country' => 'sometimes|nullable',
                'religion'     => 'sometimes|nullable|string',
                'place_of_birth' => 'sometimes|nullable|string',
                'date_of_birth' => 'sometimes|nullable|date',
                'gender' => 'sometimes|nullable|string',
                'family_rank' => 'sometimes|nullable|string',
                'email'        => 'sometimes|nullable|email',
                'phone_number' => 'sometimes|nullable|string|max:20',
                'previous_school' => 'sometimes|nullable|string',
                'nisn' => 'sometimes|nullable|string',
                'nik' => 'sometimes|nullable|integer',
                'kitas' => 'sometimes|nullable|string',
                'photo' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:5048',
                'status' => 'sometimes|required|in:Not Graduate,Graduate,Expelled,Withdraw',

                // Address
                'street'       => 'sometimes|nullable|string',
                'rt' => 'sometimes|nullable|string',
                'rw' => 'sometimes|nullable|string',
                'village' => 'sometimes|nullable|string',
                'district' => 'sometimes|nullable|string',
                'city_regency' => 'sometimes|nullable|string',
                'province'     => 'sometimes|nullable|string',
                'other'     => 'sometimes|nullable|string',

                // Parent
                'father_name' => 'sometimes|nullable|string',
                'father_company' => 'sometimes|nullable|string',
                'father_occupation' => 'sometimes|nullable|string',
                'father_phone' => 'sometimes|nullable|string',
                'father_email' => 'sometimes|nullable|email',
                'father_address_street' => 'sometimes|nullable|string',
                'father_address_rt' => 'sometimes|nullable|string',
                'father_address_rw' => 'sometimes|nullable|string',
                'father_address_village' => 'sometimes|nullable|string',
                'father_address_district' => 'sometimes|nullable|string',
                'father_address_city_regency' => 'sometimes|nullable|string',
                'father_address_province' => 'sometimes|nullable|string',
                'father_address_other' => 'sometimes|nullable|string',
                'father_company_addresses' => 'sometimes|nullable|string',

                'mother_name' => 'sometimes|nullable|string',
                'mother_company' => 'sometimes|nullable|string',
                'mother_occupation' => 'sometimes|nullable|string',
                'mother_phone' => 'sometimes|nullable|string',
                'mother_email' => 'sometimes|nullable|email', 
                'mother_address_street' => 'sometimes|nullable|string',
                'mother_address_rt' => 'sometimes|nullable|string',
                'mother_address_rw' => 'sometimes|nullable|string',
                'mother_address_village' => 'sometimes|nullable|string',
                'mother_address_district' => 'sometimes|nullable|string',
                'mother_address_city_regency' => 'sometimes|nullable|string',
                'mother_address_province' => 'sometimes|nullable|string',
                'mother_address_other' => 'sometimes|nullable|string',
                'mother_company_addresses' => 'sometimes|nullable|string',

                // Guardian
                'guardian_name' => 'sometimes|nullable|string',
                'relation_to_student' => 'sometimes|nullable|string',
                'guardian_phone' => 'sometimes|nullable|string',
                'guardian_email' => 'sometimes|nullable|email',
                'guardian_address_street' => 'sometimes|nullable|string',
                'guardian_address_rt' => 'sometimes|nullable|string',
                'guardian_address_rw' => 'sometimes|nullable|string',
                'guardian_address_village' => 'sometimes|nullable|string',
                'guardian_address_district' => 'sometimes|nullable|string',
                'guardian_address_city_regency' => 'sometimes|nullable|string',
                'guardian_address_province' => 'sometimes|nullable|string',
                'guardian_address_other' => 'sometimes|nullable|string',

                // Enrollment
                'residence_id' => 'sometimes|nullable|exists:residence_halls,residence_id',
                'transportation_id' => 'sometimes|nullable|exists:transportations,transport_id',
                'pickup_point_id' => 'sometimes|nullable|exists:pickup_points,pickup_point_id',
                'pickup_point_custom' => 'sometimes|nullable|string',
                'residence_hall_policy'  => 'sometimes|nullable|string',
                'transportation_policy'  => 'sometimes|nullable|string',
            ]);

            // --- Update data di tabel terkait ---
            $studentData = collect($validated)->except(['academic_status', 'academic_status_other'])->toArray();
            $student->update(array_filter($studentData, fn($v) => !is_null($v)));
            if (isset($validated['status'])) {
                $inactiveStatuses = ['graduate', 'expelled', 'withdraw'];

                if (in_array(strtolower($validated['status']), $inactiveStatuses)) {
                    $student->active = 'NO';

                    $latestEnrollment = $student->enrollments()
                        ->orderByDesc('registration_date')
                        ->first();
                    
                    if ($latestEnrollment) {
                        $latestEnrollment->status = 'INACTIVE';
                        $latestEnrollment->save();
                    }
                } else {
                    $student->active = 'YES';
                    
                    $latestEnrollment = $student->enrollments()
                        ->orderByDesc('registration_date')
                        ->first();

                    if ($latestEnrollment) {
                        $latestEnrollment->status = 'ACTIVE';
                        $latestEnrollment->save();
                    }
                }

                $student->save();
            }

            if ($request->hasFile('photo')) {
                $timestamp = now()->format('Y-m-d_H-i-s');
                $extension = $request->file('photo')->getClientOriginalExtension();
                $fileName = "{$timestamp}.{$extension}";
                $folder = "students/{$student->student_id}";
                $photoPath = $request->file('photo')->storeAs($folder, $fileName, 'public');
                $student->photo_path = $photoPath;
                $student->save();
            }

            if ($request->hasAny(['street', 'city_regency', 'province'])) {
                $student->studentAddress()->updateOrCreate(
                    ['student_id' => $student->student_id],
                    $request->only(['street', 'city_regency', 'province'])
                );
            }

            if ($request->hasAny(['father_name', 'mother_name'])) {
                $student->studentParent()->updateOrCreate(
                    ['student_id' => $student->student_id],
                    $request->only([
                        'father_name', 'father_company', 'father_occupation', 'father_phone', 'father_email',
                        'father_address_street', 'father_address_rt', 'father_address_rw', 'father_address_village',
                        'father_address_district', 'father_address_city_regency', 'father_address_province', 'father_address_other',
                        'father_company_addresses',
                        'mother_name', 'mother_company', 'mother_occupation', 'mother_phone', 'mother_email',
                        'mother_address_street', 'mother_address_rt', 'mother_address_rw', 'mother_address_village',
                        'mother_address_district', 'mother_address_city_regency', 'mother_address_province', 'mother_address_other',
                        'mother_company_addresses',
                    ])
                );
            }

            if ($request->hasAny(['guardian_name'])) {
                $student->studentGuardian()->updateOrCreate(
                    ['student_id' => $student->student_id],
                    $request->only([
                        'guardian_name', 'relation_to_student', 'guardian_phone', 'guardian_email',
                        'guardian_address_street', 'guardian_address_rt', 'guardian_address_rw', 'guardian_address_village',
                        'guardian_address_district', 'guardian_address_city_regency', 'guardian_address_province', 'guardian_address_other',
                    ])
                );
            }

            if ($request->hasAny([
                'residence_id', 'transportation_id', 'pickup_point_id',
                'pickup_point_custom', 'residence_hall_policy', 'transportation_policy'
            ])) {
                // Ambil enrollment terbaru student ini
                $latestEnrollment = $student->enrollments()
                    ->orderByDesc('registration_date')
                    ->first();

                if ($latestEnrollment) {
                    $latestEnrollment->update([
                        'residence_id'          => $request->residence_id ?? $latestEnrollment->residence_id,
                        'transportation_id'     => $request->transportation_id ?? $latestEnrollment->transportation_id,
                        'pickup_point_id'       => $request->pickup_point_id ?? $latestEnrollment->pickup_point_id,
                        'pickup_point_custom'   => $request->pickup_point_custom ?? $latestEnrollment->pickup_point_custom,
                        'residence_hall_policy' => $request->residence_hall_policy ?? $latestEnrollment->residence_hall_policy,
                        'transportation_policy' => $request->transportation_policy ?? $latestEnrollment->transportation_policy,
                    ]);
                } else {
                    // Kalau belum ada enrollment → buat baru
                    $student->enrollments()->create([
                        'residence_id'          => $request->residence_id,
                        'transportation_id'     => $request->transportation_id,
                        'pickup_point_id'       => $request->pickup_point_id,
                        'pickup_point_custom'   => $request->pickup_point_custom,
                        'residence_hall_policy' => $request->residence_hall_policy,
                        'transportation_policy' => $request->transportation_policy,
                    ]);
                }
            }


            // --- Buat snapshot baru di ApplicationFormVersion ---
            $oldSnapshot = $latestVersion->data_snapshot ? json_decode($latestVersion->data_snapshot, true) : [];
            $oldRequestData = $oldSnapshot['request_data'] ?? [];

            // Gabungkan data lama + input baru
            $newRequestData = array_merge($oldRequestData, $validated);
            unset($newRequestData['photo']);

            $newRequestData['student_active'] = $student->active;
            unset($newRequestData['active']);
            
            if ($student->photo_path) {
                $newRequestData['photo_path'] = $student->photo_path;
                $newRequestData['photo_url']  = asset('storage/' . $student->photo_path);
            }

            $latestEnrollment = $student->enrollments()
                ->orderByDesc('registration_date')
                ->first();
            $latestEnrollment->refresh();
            $newRequestData['enrollment_status'] = $latestEnrollment->status;


            $newSnapshot = [
                'student_id'     => $student->student_id,
                'registration_id' => $latestEnrollment?->registration_id,
                'enrollment_id'  => $latestEnrollment?->enrollment_id,
                'registration_number' =>$latestEnrollment?->enrollment_id,
                'registration_date' =>$latestEnrollment?->registration_date,
                'application_id' => $latestVersion->application_id,
                'semester'     => $latestEnrollment?->semester->number,        
                'school_year'  => $latestEnrollment?->schoolYear->year, 
                'request_data'   => $newRequestData,
                'timestamp'      => now(),
                'action'         => 'Update',
            ];

            $applicationId = $latestVersion->application_id;
            $maxVersion = ApplicationFormVersion::where('application_id', $applicationId)->max('version');
            $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
            
            $userName = auth()->user()->name ?? 'system';

            $newVersion = ApplicationFormVersion::create([
                'application_id' => $latestVersion->application_id,
                'version' => $nextVersion,
                'updated_by' => $userName,
                'action' => 'update',
                'data_snapshot' => json_encode($newSnapshot, JSON_PRETTY_PRINT),
            ]);

            DB::commit();

            $this->auditTrail->log('update_student', [
                'student_id' => $student->student_id,
                'changes'    => $validated,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student updated and new application form version created',
                'version_id' => $newVersion->version_id,
                'data' => $newSnapshot,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            // error validasi biar jelas
            return response()->json([
                'success' => false,
                'type' => 'validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            // error umum biar frontend bisa baca detail
            return response()->json([
                'success' => false,
                'type' => 'server',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => config('app.debug') ? $e->getTrace() : [] // trace dikirim hanya kalau APP_DEBUG=true
            ], 500);
        }
    }

    public function getStudentHistoryDates($studentId)
    {
        $histories = ApplicationFormVersion::whereHas('applicationForm.enrollment', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->with(['applicationForm.enrollment.schoolYear'])
            ->orderBy('updated_at', 'desc')
            ->get(['version_id', 'application_id', 'updated_at']);

        $grouped = $histories->groupBy(function ($item) {
            return $item->applicationForm->enrollment->schoolYear->year ?? 'Unknown Year';
        });

        $formatted = $grouped->map(function ($items, $year) {
            return [
                'school_year' => $year,
                'dates' => $items->map(function ($item) {
                    return [
                        'version_id' => $item->version_id,
                        'application_id' => $item->application_id,
                        'updated_at' => $item->updated_at->format('d F H:i'),
                    ];
                })->values(),
            ];
        })->values();

        return response()->json($formatted);
    }

    public function getHistoryDetail($versionId)
    {
        try {
            $version = ApplicationFormVersion::with('applicationForm.enrollment.student')
                ->findOrFail($versionId);

            return response()->json([
                'success'            => true,
                'version_id'         => $version->version_id,
                'student_id'         => $version->applicationForm->enrollment->student_id ?? null,
                'application_form_id'=> $version->application_id,
                'updated_at'         => $version->updated_at,
                'data_snapshot'      => json_decode($version->data_snapshot, true),
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'History version not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}
