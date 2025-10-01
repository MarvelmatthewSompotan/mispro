<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            ->orderBy('enrollments.registration_date', 'desc')
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
                'photo_url' => $requestData['photo_url'] ?? null,

                
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
            \Log::info($request->all());
            if ($request->hasFile('photo')) {
                \Log::info('Upload file masuk');
                $timestamp = now()->format('Y-m-d_H-i-s');
                $extension = $request->file('photo')->getClientOriginalExtension();
                $fileName = "{$timestamp}.{$extension}";
                $folder = "students/{$student->student_id}";
                $photoPath = $request->file('photo')->storeAs($folder, $fileName, 'public');
                \Log::info('Photo path tersimpan: '.$photoPath);
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
            
            if ($student->photo_path) {
                $newRequestData['photo_path'] = $student->photo_path;
                $newRequestData['photo_url']  = asset('storage/' . $student->photo_path);
            }

            // Ambil enrollment terbaru student
            $latestEnrollment = $student->enrollments()
            ->orderByDesc('registration_date')
            ->first();

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

            $maxVersion = ApplicationFormVersion::whereHas('applicationForm.enrollment.student', function($q) use ($student_id) {
                $q->where('student_id', $student_id);
            })->max('version');

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

            return response()->json([
                'success' => true,
                'message' => 'Student updated and new application form version created',
                'version_id' => $newVersion->version_id,
                'data' => array_merge($newSnapshot, [
                    'photo_url' => $student->photo_path ? asset('storage/'.$student->photo_path) : null,
                ]),
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
        $dates = ApplicationFormVersion::whereHas('applicationForm.enrollment', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->orderBy('updated_at', 'desc')
            ->get(['version_id', 'application_id', 'updated_at']);

        return response()->json($dates);
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
