<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Draft;
use App\Models\Major;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use App\Models\Guardian;
use App\Models\Enrollment;
use App\Models\SchoolYear;
use App\Models\PickupPoint;
use App\Models\SchoolClass;
use Illuminate\Support\Str;
use App\Models\DiscountType;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationFormVersion;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ApplicationPreviewResource;

class RegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Enrollment::with(['student', 'section', 'schoolYear', 'semester', 'applicationForm'])
            ->select('enrollments.*') // ambil semua kolom enrollment
            ->selectRaw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name) AS full_name")
            ->join('students', 'students.student_id', '=', 'enrollments.student_id');

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

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('students.student_id', 'like', "%$search%")
                ->orWhere(DB::raw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)"), 'like', "%$search%");
            });
        }

        // Order by created_at supaya kelihatan histori pendaftaran
        $query->orderBy('enrollments.registration_date', 'desc');

        $perPage = $request->input('per_page', 20);
        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => $data->isEmpty() ? 'No students found' : 'Students retrieved successfully',
            'data' => $data
        ], 200);
    }



    /**
     * Start registration process with initial context
     */
    public function startRegistration(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'school_year_id' => 'required|integer|exists:school_years,school_year_id',
            'semester_id' => 'required|integer|exists:semesters,semester_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $validated = $validator->validated();

        $uuid = Str::uuid();

        $draft = Draft::create([
            'draft_id' => $uuid,
            'user_id' => auth()->id(),
            'school_year_id' => $validated['school_year_id'],
            'semester_id' => $validated['semester_id'],
            'registration_date_draft' => now(),
        ]);

        return $response = response()->json([
            'success' => true,
            'message' => 'Initial registration context saved successfully.',
            'data' => [
                'draft_id' => $uuid, 
                'school_year_id' => $validated['school_year_id'],
                'semester_id' => $validated['semester_id'],
                'registration_date' => $draft->registration_date_draft,
            ],
        ], 200);
        
    }

    /**
     * Get current registration context
     */
    public function getRegistrationContext($draft_id)
    {
        $draft = Draft::where('draft_id', $draft_id)
            ->where('user_id', auth()->id())
            ->first();
        
        if (!$draft) {
            return response()->json([
                'success' => false,
                'error' => 'Draft not found or unauthorized access.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'school_year' => $draft->school_year_id,
                'semester' => $draft->semester_id,
                'registration_date' => $draft->registration_date_draft,
            ],
        ], 200);
    }

    private function generateStudentId($schoolYearId, $sectionId, $majorId)
    {
        $schoolYear = SchoolYear::findOrFail($schoolYearId);
        $startYear = explode('/', $schoolYear->year)[0]; 
        $yearCode = substr($startYear, -2);              

        $prefix = "{$yearCode}{$sectionId}{$majorId}";   

        $latest = Student::where('student_id', 'LIKE', "{$prefix}%")
            ->orderByDesc('student_id')
            ->lockForUpdate()
            ->value('student_id');

        if ($latest) {
            $lastNumber = (int)substr($latest, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $number = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        return "{$prefix}{$number}"; 
    }


    private function getSectionRegistrationNumber($section_id, $registration_date)
    {
        $date = Carbon::parse($registration_date);
        $month = $date->month;
        $year = $date->year;

        $count = DB::transaction(function () use ($section_id, $month, $year) {
            return DB::table('students')
                ->join('enrollments', 'students.student_id', '=', 'enrollments.student_id')
                ->join('classes', 'enrollments.class_id', '=', 'classes.class_id')
                ->where('enrollments.section_id', $section_id)
                ->whereMonth('students.registration_date', $month)
                ->whereYear('students.registration_date', $year)
                ->lockForUpdate()
                ->count();
        });

        $number = ($count % 999) + 1;

        return str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    private function formatRegistrationId($number, $section_id, $registration_date)
    {
        $sectionCodes = [
            1 => 'ECP',
            2 => 'ES',
            3 => 'MS',
            4 => 'HS',
        ];

        $romanMonths = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];

        $date = Carbon::parse($registration_date);
        $month = $date->month;
        $year = $date->year;
        $yearShort = substr($year, -2);

        $sectionCode = $sectionCodes[$section_id] ?? 'XX';
        $romanMonth = $romanMonths[$month];

        return "{$number}/RF.No-{$sectionCode}/{$romanMonth}-{$yearShort}";
    }

    public function store(Request $request, $draft_id)
    {
        // Tambahkan logging untuk debug
        \Log::info('Registration store called', [
            'draft_id' => $draft_id,
            'request_data' => $request->all(),
            'user_id' => auth()->id()
        ]);

        DB::beginTransaction();
        try {
            $draft = Draft::where('draft_id', $draft_id)
                ->where('user_id', auth()->id())
                ->first();
            
            if (!$draft) {
                return response()->json([
                    'success' => false,
                    'message' => 'Draft not found or unauthorized.',
                ], 404);
            }

            // validate request
            $validated = $request->validate([
                // student
                'student_status' => 'required|in:New,Old,Transferee',
                'input_name' => 'nullable|string',
                'first_name' => 'required|string',
                'middle_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'nickname' => 'nullable|string',
                'citizenship' => 'required|in:Indonesia,Non Indonesia',
                'country' => function ($attribute, $value, $fail) use ($request) {
                    if ($request->citizenship === 'Non Indonesia' && empty($value)) {
                        $fail('The country field is required when selecting "Non-Indonesia" as the citizenship.');
                    }
                },
                'religion' => 'required|string',
                'place_of_birth' => 'required|string',
                'date_of_birth' => 'required|date',
                'email' => 'required|email',
                'phone_number' => 'required|string',
                'previous_school' => 'required|string',
                'academic_status' => 'required|in:REGULAR,SIT-IN,OTHER',
                'academic_status_other' => function ($attribute, $value, $fail) use ($request) {
                    if ($request->academic_status === 'OTHER' && empty($value)) {
                        $fail('The academic_status_other field is required when selecting "OTHER" as the academic status.');
                    }
                },
                'gender' => 'required|in:MALE,FEMALE',
                'family_rank' => 'required|string',
                'age' => 'required|string',
                'nisn' => 'required|string',
                'nik' => 'nullable|integer',
                'kitas' => 'nullable|string',

                // student address - Pastikan semua field wajib terisi
                'street' => 'required|string',
                'rt' => 'nullable|string',
                'rw' => 'nullable|string',
                'village' => 'required|string',
                'district' => 'required|string',
                'city_regency' => 'required|string', // Pastikan required
                'province' => 'required|string',
                'other' => 'nullable|string',

                // program, class, major
                'section_id' => 'required|exists:sections,section_id',
                'program_id' => 'nullable|exists:programs,program_id',
                'class_id' => 'required|exists:classes,class_id',
                'major_id' => 'required|exists:majors,major_id',
                'program_other' => function ($attribute, $value, $fail) use ($request) {
                    if (empty($request->program_id) && empty($value)) {
                        $fail('The program_other field is required when selecting "Other" as the program.');
                    }
                },
                
                // Facilities
                'transportation_id' => 'nullable|exists:transportations,transport_id',
                'pickup_point_id' => 'nullable|integer|exists:pickup_points,pickup_point_id',
                'pickup_point_custom' => 'nullable|string|max:255',
                'transportation_policy' => 'required|in:Signed,Not Signed',
                'residence_id' => 'required|integer|exists:residence_halls,residence_id',
                'residence_hall_policy' => 'required|in:Signed,Not Signed',

                // student parent (father)
                'father_name' => 'nullable|string',
                'father_company' => 'nullable|string',
                'father_occupation' => 'nullable|string',
                'father_phone' => 'nullable|string',
                'father_email' => 'nullable|email', // Perbaiki email validation
                'father_address_street' => 'nullable|string',
                'father_address_rt' => 'nullable|string',
                'father_address_rw' => 'nullable|string',
                'father_address_village' => 'nullable|string',
                'father_address_district' => 'nullable|string',
                'father_address_city_regency' => 'nullable|string',
                'father_address_province' => 'nullable|string',
                'father_address_other' => 'nullable|string',
                'father_company_addresses' => 'nullable|string',

                // student parent (mother)
                'mother_name' => 'nullable|string',
                'mother_company' => 'nullable|string',
                'mother_occupation' => 'nullable|string',
                'mother_phone' => 'nullable|string',
                'mother_email' => 'nullable|email', // Perbaiki email validation
                'mother_address_street' => 'nullable|string',
                'mother_address_rt' => 'nullable|string',
                'mother_address_rw' => 'nullable|string',
                'mother_address_village' => 'nullable|string',
                'mother_address_district' => 'nullable|string',
                'mother_address_city_regency' => 'nullable|string',
                'mother_address_province' => 'nullable|string',
                'mother_address_other' => 'nullable|string',
                'mother_company_addresses' => 'nullable|string',

                // student parent (guardian)
                'guardian_name' => 'nullable|string',
                'relation_to_student' => 'nullable|string',
                'guardian_phone' => 'nullable|string',
                'guardian_email' => 'nullable|email', // Perbaiki email validation
                'guardian_address_street' => 'nullable|string',
                'guardian_address_rt' => 'nullable|string',
                'guardian_address_rw' => 'nullable|string',
                'guardian_address_village' => 'nullable|string',
                'guardian_address_district' => 'nullable|string',
                'guardian_address_city_regency' => 'nullable|string',
                'guardian_address_province' => 'nullable|string',
                'guardian_address_other' => 'nullable|string',
                
                // payment
                'tuition_fees' => 'required|in:Full Payment,Installment',
                'residence_payment' => 'required|in:Full Payment,Installment',
                'financial_policy_contract' => 'required|in:Signed,Not Signed',

                // discount
                'discount_name' => 'nullable|string',
                'discount_notes' => 'nullable|string',
            ]);

            if (empty($validated['program_id']) && !empty($validated['program_other'])) {
                $program = Program::create([
                    'name' => $validated['program_other'],
                ]);
                $validated['program_id'] = $program->program_id;
            }
            
            // data master
            $program = Program::findOrFail($validated['program_id']);
            $schoolClass = SchoolClass::findOrFail($validated['class_id']);
            $major = Major::findOrFail($validated['major_id']);
            $section = Section::findOrFail($validated['section_id']);

            $transportation = null;
            if (!empty($validated['transportation_id'])) {
                $transportation = Transportation::findOrFail($validated['transportation_id']);
            }

            $residenceHall = ResidenceHall::findOrFail($validated['residence_id']);

            // // program 
            // if ($program->name == 'Other' && !empty($validated['program_other'])) {
            //     $customProgram = Program::firstOrCreate(['name' => $validated['program_other']]);
            //     $program = $customProgram; 
            // }

            $pickupPoint = null;
            if ($validated['pickup_point_id']) {
                $pickupPoint = PickupPoint::findOrFail($validated['pickup_point_id']);
            } elseif ($validated['pickup_point_custom']) {
                $pickupPoint = PickupPoint::firstOrCreate([
                    'name' => $validated['pickup_point_custom'],
                ]);
            }

            // registration id
            $number = $this->getSectionRegistrationNumber($validated['section_id'], $draft->registration_date_draft);
            $registrationId = $this->formatRegistrationId(
                $number,
                $validated['section_id'],
                $draft->registration_date_draft
            );
            
            $status = $validated['student_status'];
            $student = null;
            
            if ($status === 'New' || $status === 'Transferee') {
                // Check existing student
                $existingStudent = Student::where(function($query) use ($validated) {
                    $query->where('first_name', $validated['first_name'])
                        ->where('last_name', $validated['last_name'])
                        ->where('date_of_birth', $validated['date_of_birth'])
                        ->where('place_of_birth', $validated['place_of_birth'])
                        ->where('previous_school', $validated['previous_school']);
                })
                ->orWhere(function($query) use ($validated) {
                    if (!empty($validated['nik'])) {
                        $query->where('nik', $validated['nik']);
                    }
                })
                ->orWhere(function($query) use ($validated) {
                    if (!empty($validated['kitas'])) {
                        $query->where('kitas', $validated['kitas']);
                    }
                })
                ->first();
                
                if ($existingStudent) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student already exists, please select Old status and input student name'
                    ], 422);
                }
                
                // Generate new student ID
                $generatedId = $this->generateStudentId(
                    $draft->school_year_id,  
                    $validated['section_id'], 
                    $validated['major_id']
                );
                
                // Create new student
                $student = Student::create([
                    'student_id' => $generatedId,
                    'student_status' => $validated['student_status'],
                    'first_name' => $validated['first_name'],
                    'middle_name' => $validated['middle_name'],
                    'last_name' => $validated['last_name'],
                    'nickname' => $validated['nickname'],
                    'gender' => $validated['gender'],
                    'age' => $validated['age'] ?: $this->calculateAge($validated['date_of_birth']),
                    'family_rank' => $validated['family_rank'],
                    'citizenship' => $validated['citizenship'],
                    'country' => $validated['citizenship'] === 'Non Indonesia' ? $validated['country'] : null,
                    'religion' => $validated['religion'],
                    'place_of_birth' => $validated['place_of_birth'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'email' => $validated['email'],
                    'previous_school' => $validated['previous_school'],
                    'phone_number' => $validated['phone_number'],
                    'academic_status' => $validated['academic_status'],
                    'academic_status_other' => $validated['academic_status'] === 'OTHER' ? $validated['academic_status_other'] : null,
                    'registration_date' => $draft->registration_date_draft,
                    'enrollment_status' => 'ACTIVE',
                    'nik' => $validated['nik'],
                    'kitas' => $validated['kitas'],
                    'nisn' => $validated['nisn'],
                ]);
                // Create enrollment (sama untuk New dan Old)
                $enrollment = $student->enrollments()->create([
                    'registration_date' => $draft->registration_date_draft,
                    'registration_id' => $registrationId,
                    'class_id' => $schoolClass->class_id,
                    'section_id' => $section->section_id,
                    'major_id' => $major->major_id,
                    'semester_id' => $draft->semester_id,
                    'school_year_id' => $draft->school_year_id,
                    'program_id' => $program->program_id,
                    'transport_id' => $transportation ? $transportation->transport_id : null,
                    'pickup_point_id' => $pickupPoint ? $pickupPoint->pickup_point_id : null,
                    'residence_id' => $residenceHall->residence_id,
                    'residence_hall_policy' => $validated['residence_hall_policy'], 
                    'transportation_policy' => $validated['transportation_policy'],
                    'is_active' => true,
                ]);
                
                // Create application form
                $applicationForm = $this->createApplicationForm($enrollment);
                
                // Create application form version dengan data snapshot
                $this->createApplicationFormVersion($applicationForm, $validated, $student, $enrollment);

                // Create student address, parent, guardian for new student
                $this->createStudentRelatedData($student, $validated, $enrollment);
                
            } else if ($status === 'Old') {
                // ✅ PERBAIKAN: Gunakan student yang sudah ada
                $existingStudentId = $validated['input_name'];
                if (!$existingStudentId) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student ID is required for Old student'
                    ], 422);
                }
                
                // Find existing student
                $student = Student::find($existingStudentId);
                if (!$student) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student not found'
                    ], 404);
                }
                // Create enrollment (sama untuk New dan Old)
                $enrollment = $student->enrollments()->create([
                    'registration_date' => $draft->registration_date_draft,
                    'registration_id' => $registrationId,
                    'class_id' => $schoolClass->class_id,
                    'section_id' => $section->section_id,
                    'major_id' => $major->major_id,
                    'semester_id' => $draft->semester_id,
                    'school_year_id' => $draft->school_year_id,
                    'program_id' => $program->program_id,
                    'transport_id' => $transportation ? $transportation->transport_id : null,
                    'pickup_point_id' => $pickupPoint ? $pickupPoint->pickup_point_id : null,
                    'residence_id' => $residenceHall->residence_id,
                    'residence_hall_policy' => $validated['residence_hall_policy'], 
                    'transportation_policy' => $validated['transportation_policy'],
                    'is_active' => true,
                ]);
                // Create application form
                $applicationForm = $this->createApplicationForm($enrollment);

                // Create application form version dengan data snapshot
                $this->createApplicationFormVersion($applicationForm, $validated, $student, $enrollment);

                // ✅ PERBAIKAN: Update student data jika ada perubahan
                $this->updateStudentData($student, $validated, $registrationId, $draft);
                
                // ✅ PERBAIKAN: Update atau create related data
                $this->updateStudentRelatedData($student, $validated, $enrollment);
            }
            
            // Clear draft
            $draft->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Registration submitted successfully.',
                'data' => [
                    'student_id' => $student->student_id,
                    'registration_id' => $registrationId,
                    'application_id' => $applicationForm->application_id,
                    'registration_number' =>$enrollment->enrollment_id
                ],
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Registration store error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false, 
                'error' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showPreview($applicationId)
    {
        try {
            // ✅ PERBAIKAN: Tambahkan logging untuk debug
            \Log::info('Preview called for application ID:', ['application_id' => $applicationId]);
            
            $application = ApplicationForm::with([
                'enrollment.student.studentAddress',
                'enrollment.schoolClass',
                'enrollment.program',
                'enrollment.transportation',
                'enrollment.residenceHall',
                'enrollment.studentDiscount.discountType',
                'enrollment.student.studentParent.fatherAddress',
                'enrollment.student.studentParent.motherAddress',
                'enrollment.student.studentGuardian.guardian.guardianAddress',
                'enrollment.student.payments',
            ])->findOrFail($applicationId);
            
            \Log::info('Application found:', ['application' => $application]);
            
            return response()->json([
                'success' => true,
                'message' => 'Preview data retrieved successfully',
                'data' => new ApplicationPreviewResource($application)
            ], 200);
        } catch (\Exception $e) {
            // ✅ PERBAIKAN: Log error yang lebih detail
            \Log::error('Preview failed for application ID: ' . $applicationId, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Preview failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    // Helper methods
    private function calculateAge($dateOfBirth)
    {
        $dateOfBirth = Carbon::parse($dateOfBirth);
        $diff = $dateOfBirth->diff(Carbon::now());
        return "{$diff->y} years {$diff->m} months";
    }

    private function createStudentRelatedData($student, $validated, $enrollment)
    {
        // Create student address
        $student->studentAddress()->create([
            'street' => $validated['street'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'village' => $validated['village'],
            'district' => $validated['district'],
            'city_regency' => $validated['city_regency'],
            'province' => $validated['province'],
            'other' => $validated['other'],
        ]);
        
        // Create student parent & addresses
        $studentParent = $student->studentParent()->create([
            'father_name' => $validated['father_name'],
            'father_company' => $validated['father_company'],
            'father_occupation' => $validated['father_occupation'],
            'father_phone' => $validated['father_phone'],
            'father_email' => $validated['father_email'],
            'mother_name' => $validated['mother_name'],
            'mother_company' => $validated['mother_company'],
            'mother_occupation' => $validated['mother_occupation'],
            'mother_phone' => $validated['mother_phone'],
            'mother_email' => $validated['mother_email'],
            'mother_company_addresses' => $validated['mother_company_addresses'],
        ]);
        
        // Create addresses
        $this->createParentAddresses($studentParent, $validated);
        $this->createGuardianData($student, $validated);
        $this->createPayment($student, $validated, $enrollment);
    }

    private function createParentAddresses($studentParent, $validated)
    {
        $studentParent->fatherAddress()->create([
            'street' => $validated['father_address_street'],
            'rt' => $validated['father_address_rt'],
            'rw' => $validated['father_address_rw'],
            'village' => $validated['father_address_village'],
            'district' => $validated['father_address_district'],
            'city_regency' => $validated['father_address_city_regency'],
            'province' => $validated['father_address_province'],
            'other' => $validated['father_address_other'],
            'father_company_addresses' => $validated['father_company_addresses'],
        ]);
        $studentParent->motherAddress()->create([
            'street' => $validated['mother_address_street'],
            'rt' => $validated['mother_address_rt'],
            'rw' => $validated['mother_address_rw'],
            'village' => $validated['mother_address_village'],
            'district' => $validated['mother_address_district'],
            'city_regency' => $validated['mother_address_city_regency'],
            'province' => $validated['mother_address_province'],
            'other' => $validated['mother_address_other'],
        ]);
    }

    private function createGuardianData($student, $validated)
    {
        $guardian = Guardian::create([
            'guardian_name' => $validated['guardian_name'],
            'relation_to_student' => $validated['relation_to_student'],
            'phone_number' => $validated['guardian_phone'],
            'guardian_email' => $validated['guardian_email'],
        ]);
        $studentGuardian = $student->studentGuardian()->create(['guardian_id' => $guardian->guardian_id]);
        $guardian->guardianAddress()->create([
            'street' => $validated['guardian_address_street'],
            'rt' => $validated['guardian_address_rt'],
            'rw' => $validated['guardian_address_rw'],
            'village' => $validated['guardian_address_village'],
            'district' => $validated['guardian_address_district'],
            'city_regency' => $validated['guardian_address_city_regency'],
            'province' => $validated['guardian_address_province'],
            'other' => $validated['guardian_address_other'],
        ]);
    }

    private function createPayment($student, $validated, $enrollment)
    {
        Payment::create([
            'student_id' => $student->student_id,
            'tuition_fees' => $validated['tuition_fees'],
            'residence_payment' => $validated['residence_payment'],
            'financial_policy_contract' => $validated['financial_policy_contract'],
        ]);

        // discount
        if ($validated['discount_name']) {
            $discountType = DiscountType::firstOrCreate(['name' => $validated['discount_name']]);
            $enrollment->studentDiscount()->create([
                'discount_type_id' => $discountType->discount_type_id,
                'notes' => $validated['discount_notes'],
            ]);
        }  
    }

    private function updateStudentData($student, $validated, $registrationId, $draft)
    {
        // Update student data jika ada perubahan
        $student->update([
            'student_status' => $validated['student_status'],
            'registration_id' => $registrationId,
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'nickname' => $validated['nickname'],
            'gender' => $validated['gender'],
            'age' => $validated['age'] ?: $this->calculateAge($validated['date_of_birth']),
            'family_rank' => $validated['family_rank'],
            'citizenship' => $validated['citizenship'],
            'country' => $validated['citizenship'] === 'Non Indonesia' ? $validated['country'] : null,
            'religion' => $validated['religion'],
            'place_of_birth' => $validated['place_of_birth'],
            'date_of_birth' => $validated['date_of_birth'],
            'email' => $validated['email'],
            'previous_school' => $validated['previous_school'],
            'phone_number' => $validated['phone_number'],
            'academic_status' => $validated['academic_status'],
            'academic_status_other' => $validated['academic_status'] === 'OTHER' ? $validated['academic_status_other'] : null,
            'enrollment_status' => 'ACTIVE',
            'nik' => $validated['nik'],
            'kitas' => $validated['kitas'],
            'nisn' => $validated['nisn'],
        ]);
    }

    private function updateStudentRelatedData($student, $validated, $enrollment)
    {
        // Update atau create address
        $student->studentAddress()->updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'street' => $validated['street'],
                'rt' => $validated['rt'],
                'rw' => $validated['rw'],
                'village' => $validated['village'],
                'district' => $validated['district'],
                'city_regency' => $validated['city_regency'],
                'province' => $validated['province'],
                'other' => $validated['other'],
            ]
        );
        
        // Update atau create parent data
        $student->studentParent()->updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'father_name' => $validated['father_name'],
                'father_company' => $validated['father_company'],
                'father_occupation' => $validated['father_occupation'],
                'father_phone' => $validated['father_phone'],
                'father_email' => $validated['father_email'],
                'mother_name' => $validated['mother_name'],
                'mother_company' => $validated['mother_company'],
                'mother_occupation' => $validated['mother_occupation'],
                'mother_phone' => $validated['mother_phone'],
                'mother_email' => $validated['mother_email'],
                'mother_company_addresses' => $validated['mother_company_addresses'],
            ]
        );
        
        // Update addresses
        $this->updateParentAddresses($student, $validated);
        $this->updateGuardianData($student, $validated);
        $this->updatePayment($student, $validated, $enrollment);
    }

    private function updateParentAddresses($student, $validated)
    {
        // Dapatkan studentParent terlebih dahulu
        $studentParent = $student->studentParent;
        
        if ($studentParent) {
            // Update father address
            $studentParent->fatherAddress()->updateOrCreate(
                ['parent_id' => $studentParent->parent_id],
                [
                    'street' => $validated['father_address_street'],
                    'rt' => $validated['father_address_rt'],
                    'rw' => $validated['father_address_rw'],
                    'village' => $validated['father_address_village'],
                    'district' => $validated['father_address_district'],
                    'city_regency' => $validated['father_address_city_regency'],
                    'province' => $validated['father_address_province'],
                    'other' => $validated['father_address_other'],
                    'father_company_addresses' => $validated['father_company_addresses'],
                ]
            );

            // Update mother address
            $studentParent->motherAddress()->updateOrCreate(
                ['parent_id' => $studentParent->parent_id],
                [
                    'street' => $validated['mother_address_street'],
                    'rt' => $validated['mother_address_rt'],
                    'rw' => $validated['mother_address_rw'],
                    'village' => $validated['mother_address_village'],
                    'district' => $validated['mother_address_district'],
                    'city_regency' => $validated['mother_address_city_regency'],
                    'province' => $validated['mother_address_province'],
                    'other' => $validated['mother_address_other'],
                ]
            );
        }
    }

    private function updateGuardianData($student, $validated)
    {
        $guardian = Guardian::updateOrCreate([
            'guardian_name' => $validated['guardian_name'],
            'relation_to_student' => $validated['relation_to_student'],
            'phone_number' => $validated['guardian_phone'],
            'guardian_email' => $validated['guardian_email'],
        ]);
        $studentGuardian = $student->studentGuardian()->updateOrCreate(['guardian_id' => $guardian->guardian_id]);
        $guardian->guardianAddress()->updateOrCreate([
            'street' => $validated['guardian_address_street'],
            'rt' => $validated['guardian_address_rt'],
            'rw' => $validated['guardian_address_rw'],
            'village' => $validated['guardian_address_village'],
            'district' => $validated['guardian_address_district'],
            'city_regency' => $validated['guardian_address_city_regency'],
            'province' => $validated['guardian_address_province'],
            'other' => $validated['guardian_address_other'],
        ]);
    }

    private function updatePayment($student, $validated, $enrollment)
    {
        Payment::updateOrCreate([
            'student_id' => $student->student_id,
            'tuition_fees' => $validated['tuition_fees'],
            'residence_payment' => $validated['residence_payment'],
            'financial_policy_contract' => $validated['financial_policy_contract'],
        ]);

        // discount
        if ($validated['discount_name']) {
            $discountType = DiscountType::updateOrCreate(['name' => $validated['discount_name']]);
            $enrollment->studentDiscount()->create([
                'discount_type_id' => $discountType->discount_type_id,
                'notes' => $validated['discount_notes'],
            ]);
        }
    }

    private function createApplicationForm($enrollment)
    {
        $maxVersion = ApplicationForm::whereHas('enrollment', function($query) use ($enrollment) {
            $query->where('student_id', $enrollment->student_id);
        })->max('version');
        $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
        return ApplicationForm::create([
            'enrollment_id' => $enrollment->enrollment_id,
            'status' => 'Submitted',
            'submitted_at' => now(),
            'version' => $nextVersion,
        ]);
    }

    private function createApplicationFormVersion($applicationForm, $validated, $student, $enrollment)
    {
        $dataSnapshot = [
            'student_id' => $student->student_id,
            'enrollment_id' => $enrollment->enrollment_id,
            'application_id' => $applicationForm->application_id,
            'request_data' => $validated,
            'timestamp' => now(),
            'action' => 'registration'
        ];
        
        $maxVersion = ApplicationFormVersion::whereHas('applicationForm.enrollment', function($query) use ($student) {
            $query->where('student_id', $student->student_id);
        })->max('version');
        
        $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
        $userName = auth()->user()->name;

        ApplicationFormVersion::create([
            'application_id' => $applicationForm->application_id,
            'version' => $nextVersion,
            'updated_by' => $userName,
            'data_snapshot' => json_encode($dataSnapshot, JSON_PRETTY_PRINT),
        ]);
    }
}