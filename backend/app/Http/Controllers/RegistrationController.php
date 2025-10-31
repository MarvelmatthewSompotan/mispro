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
use App\Models\StudentOld;
use App\Models\PickupPoint;
use App\Models\SchoolClass;
use Illuminate\Support\Str;
use App\Models\DiscountType;
use Illuminate\Http\Request;
use App\Models\FatherAddress;
use App\Models\MotherAddress;
use App\Models\ResidenceHall;
use App\Models\StudentParent;
use App\Models\StudentAddress;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use App\Models\GuardianAddress;
use App\Models\StudentGuardian;
use Illuminate\Support\Facades\DB;
use App\Services\AuditTrailService;
use Illuminate\Support\Facades\Auth;
use App\Events\ApplicationFormCreated;
use App\Models\ApplicationFormVersion;
use Illuminate\Support\Facades\Validator;
use App\Events\ApplicationFormStatusUpdated;
use App\Http\Resources\ApplicationPreviewResource;

class RegistrationController extends Controller
{
    protected $auditTrail;

    public function __construct(AuditTrailService $auditTrail)
    {
        $this->auditTrail = $auditTrail;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Enrollment::query()
            ->select(
                'enrollments.*',
                'application_forms.application_id',
                'school_years.year as school_year',
                'classes.grade',
                'sections.name as section_name',
                'application_forms.status as application_status'
            )
            ->selectRaw("CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name) AS full_name")
            ->addSelect('application_form_versions.version_id')
            ->join('students', 'students.student_id', '=', 'enrollments.student_id')
            ->leftJoin('school_years', 'enrollments.school_year_id', '=', 'school_years.school_year_id')
            ->leftJoin('classes', 'enrollments.class_id', '=', 'classes.class_id')
            ->leftJoin('sections', 'enrollments.section_id', '=', 'sections.section_id')           
            ->leftJoin('application_forms', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
            ->leftJoin('application_form_versions', 'application_form_versions.version_id', '=', DB::raw('(SELECT MAX(version_id) FROM application_form_versions WHERE application_id = application_forms.application_id AND action = "registration")'))
            ->addSelect('application_form_versions.version_id as registration_version_id');

        // Filter Range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start = Carbon::parse($request->input('start_date'))->startOfDay();
            $end = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('enrollments.registration_date', [$start, $end]);
        }

        // Filter Search
        if ($regisId = $request->input('search_id')) {
            $query->where('registration_id', 'like', "%$regisId%");
        }

        // Filter Global
        if ($search = trim($request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $search = strtolower($search);
                $q->whereRaw('LOWER(students.student_id) LIKE ?', ["%{$search}%"])
                ->orWhereRaw("LOWER(CONCAT_WS(' ', COALESCE(students.first_name,''), COALESCE(students.middle_name,''), COALESCE(students.last_name,''))) LIKE ?", ["%{$search}%"]);
            });
        } elseif ($request->filled('search_name')) {
            $searchName = strtolower(trim($request->input('search_name')));
            $query->whereRaw("LOWER(CONCAT_WS(' ', COALESCE(students.first_name,''), COALESCE(students.middle_name,''), COALESCE(students.last_name,''))) LIKE ?", ["%{$searchName}%"]);
        }

        // Filter Checkbox
        if ($request->input('school_year')) {
            $schoolYear = $request->input('school_year');
            $query->whereIn('school_years.year', (array)$schoolYear);
        }

        if ($request->filled('grade')) {
            $grades = (array) $request->input('grade');
            $query->whereIn('classes.grade', $grades);
        }

        if ($request->filled('section')) {
            $sections = (array) $request->input('section');
            $query->whereIn('sections.name', $sections);
        }

        if ($request->filled('status')) {
            $statuses = (array) $request->input('status');
            $query->whereIn('application_forms.status', $statuses);
        }

        // Sort
        $sorts = $request->input('sort', []);

        $sortable = [
            'registration_date' => 'enrollments.registration_date',
            'registration_id' => 'enrollments.registration_id',
            'school_year' => 'school_years.year',
            'full_name' => "CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)",
            'grade' => 'classes.grade',
            'section' => 'sections.name',
            'application_status' => 'application_forms.status',
        ];

        if (empty($sorts)) {
            $query->orderBy('enrollments.registration_date', 'desc');
        } else {
            foreach ($sorts as $sort) {
                $field = $sort['field'] ?? null;
                $order = strtolower($sort['order'] ?? 'asc');

                if (!$field || !array_key_exists($field, $sortable)) continue;

                if ($field === 'registration_id') {
                    $query->orderByRaw("
                        CASE
                            WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(enrollments.registration_id, '/', -2), '/', 1) LIKE '%ES%' THEN 1    
                            WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(enrollments.registration_id, '/', -2), '/', 1) LIKE '%MS%' THEN 2    
                            WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(enrollments.registration_id, '/', -2), '/', 1) LIKE '%HS%' THEN 3    
                            ELSE 4
                        END $order
                    ")->orderByRaw("
                        CAST(SUBSTRING_INDEX(enrollments.registration_id, '/', 1) AS UNSIGNED) $order
                    ")->orderByRaw("
                        CAST(SUBSTRING_INDEX(enrollments.registration_id, '-', -1) AS UNSIGNED) $order
                    ");
                } elseif ($field === 'full_name') {
                    $query->orderByRaw($sortable[$field] . ' ' . $order);
                } elseif ($field === 'application_status') {
                    $query->orderByRaw("
                        CASE application_forms.status
                            WHEN 'Cancelled' THEN 1
                            WHEN 'Confirmed' THEN 2
                            ELSE 3
                        END $order
                    ");
                } else {
                    $query->orderByRaw($sortable[$field] . ' ' . $order);
                }
            }
        }
        
        // Pagination
        $perPage = $request->input('per_page', 25);
        $data = $query->paginate($perPage);
        $totalRegistered = ApplicationForm::count();

        return response()->json([
            'success' => true,
            'message' => $data->isEmpty() ? 'No students found' : 'Students retrieved successfully',
            'total_registered' => $totalRegistered,
            'data' => $data
        ], 200);
    }

    public function updateStatus(Request $request, $application_id)
    {
        $validator = \Validator::make($request->all(), [
            'status' => 'required|in:Confirmed,Cancelled',
            'reason' => 'required_if:status,Cancelled|in:Withdraw,Invalid',
        ], [
            'reason.required_if' => 'Field reason harus diisi jika status dibatalkan (Cancelled).',
            'reason.in' => 'Reason hanya boleh berisi Withdraw atau Invalid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $applicationForm = ApplicationForm::with(['enrollment.student', 'enrollment.schoolYear', 'enrollment.semester'])
                ->findOrFail($application_id);

            $oldStatus = $applicationForm->status;
            $newStatus = $request->status;

            $applicationForm->status = $newStatus;


            if ($newStatus === 'Cancelled') {
                if ($request->reason === 'Invalid') {
                    $applicationForm->is_invalid_data = true;
                } else {
                    $applicationForm->is_invalid_data = false;
                }
            } else {
                $applicationForm->is_invalid_data = false; 
            }

            $applicationForm->save();

            $student = $applicationForm->enrollment?->student;
            $enrollment = $applicationForm->enrollment;

            if ($student && $enrollment) {
                if ($newStatus === 'Cancelled') {
                    if ($applicationForm->is_invalid_data) {
                        $student->status = 'Not Graduate';
                        $student->active = 'YES';
                        $enrollment->status = 'INACTIVE';
                    } else {
                        $student->status = 'Withdraw';
                        $student->active = 'NO';
                        $enrollment->status = 'INACTIVE';
                    }
                } elseif ($request->status === 'Confirmed') {
                    $student->status = 'Not Graduate';
                    $student->active = 'YES';

                    $currentMonth = now()->month;
                    $currentYear = now()->year;
                    $schoolYearStr = ($currentMonth >= 7) 
                        ? $currentYear . '/' . ($currentYear + 1)
                        : ($currentYear - 1) . '/' . $currentYear;
                    
                    $schoolYear = SchoolYear::where('year', $schoolYearStr)->first();
                    $currentSchoolYearId = $schoolYear?->school_year_id;

                    if ($currentSchoolYearId && $enrollment->school_year_id === $currentSchoolYearId) {
                        $enrollment->status = 'ACTIVE';
                    } else {
                        $enrollment->status = 'INACTIVE';
                    }
                }

                $student->save(); 
                $enrollment->save();
            }

            DB::commit();
            \Log::info('Triggering ApplicationFormStatusUpdated event', [
                'application_id' => $application_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $request->reason,
                'is_invalid_data' => $applicationForm->is_invalid_data,
            ]);
            event(new ApplicationFormStatusUpdated($applicationForm, $oldStatus, $newStatus));

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $applicationForm
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
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
                'previous_school' => 'nullable|string',
                'academic_status' => 'required|in:REGULAR,SIT-IN,OTHER',
                'academic_status_other' => function ($attribute, $value, $fail) use ($request) {
                    if ($request->academic_status === 'OTHER' && empty($value)) {
                        $fail('The academic_status_other field is required when selecting "OTHER" as the academic status.');
                    }
                },
                'gender' => 'required|in:MALE,FEMALE',
                'family_rank' => 'required|string',
                'age' => 'required|string',
                'nisn' => 'nullable|string',
                'nik' => 'nullable|integer',
                'kitas' => 'nullable|string',

                'street' => 'required|string',
                'rt' => 'nullable|string',
                'rw' => 'nullable|string',
                'village' => 'required|string',
                'district' => 'required|string',
                'city_regency' => 'required|string',
                'province' => 'required|string',
                'other' => 'nullable|string',

                'section_id' => 'required|exists:sections,section_id',
                'program_id' => 'nullable|exists:programs,program_id',
                'class_id' => 'required|exists:classes,class_id',
                'major_id' => 'required|exists:majors,major_id',
                'program_other' => function ($attribute, $value, $fail) use ($request) {
                    if (empty($request->program_id) && empty($value)) {
                        $fail('The program_other field is required when selecting "Other" as the program.');
                    }
                },
                
                'transportation_id' => 'nullable|exists:transportations,transport_id',
                'pickup_point_id' => 'nullable|integer|exists:pickup_points,pickup_point_id',
                'pickup_point_custom' => 'nullable|string|max:255',
                'transportation_policy' => 'required|in:Signed,Not Signed',
                'residence_id' => 'required|integer|exists:residence_halls,residence_id',
                'residence_hall_policy' => 'required|in:Signed,Not Signed',

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
                
                'tuition_fees' => 'required|in:Full Payment,Installment',
                'residence_payment' => 'required|in:Full Payment,Installment',
                'financial_policy_contract' => 'required|in:Signed,Not Signed',

                'discount_name' => 'nullable|string',
                'discount_notes' => 'nullable|string',
            ]);

            if (empty($validated['program_id']) && !empty($validated['program_other'])) {
                $program = Program::create([
                    'name' => $validated['program_other'],
                ]);
                $validated['program_id'] = $program->program_id;
            }
            
            $program = Program::findOrFail($validated['program_id']);
            $schoolClass = SchoolClass::findOrFail($validated['class_id']);
            $major = Major::findOrFail($validated['major_id']);
            $section = Section::findOrFail($validated['section_id']);

            $transportation = null;
            if (!empty($validated['transportation_id'])) {
                $transportation = Transportation::findOrFail($validated['transportation_id']);
            }

            $residenceHall = ResidenceHall::findOrFail($validated['residence_id']);

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
            
            // check current school year
            $currentMonth = now()->month;
            $currentYear = now()->year;
            $schoolYearStr = ($currentMonth >= 7) 
                ? $currentYear . '/' . ($currentYear + 1)
                : ($currentYear - 1) . '/' . $currentYear;

            $currentSchoolYear = SchoolYear::where('year', $schoolYearStr)->first();
            $enrollmentStatus = ($draft->school_year_id === $currentSchoolYear->school_year_id) ? 'ACTIVE' : 'INACTIVE';

            $source = $request->input('source');
            if ($status === 'Old' && !in_array($source, ['new', 'old'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid source for Old student. Must be "new" or "old".'
                ], 422);
            }

            if ($status === 'New' || $status === 'Transferee') {
                // Check existing student
                $possibleStudents = Student::where(function($query) use ($validated) {
                    $query->where('first_name', $validated['first_name'])
                        ->where('last_name', $validated['last_name'])
                        ->where('date_of_birth', $validated['date_of_birth'])
                        ->where('place_of_birth', $validated['place_of_birth']);
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
                ->get();
                
                foreach ($possibleStudents as $stud) {
                    $alreadyInSection = $stud->enrollments()
                        ->where('section_id', $validated['section_id'])
                        ->exists();
    
                    if ($alreadyInSection) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Student already exists in this section (any semester), please select Old status'
                        ], 422);
                    }
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
                    'first_name' => $validated['first_name'],
                    'middle_name' => $validated['middle_name'],
                    'last_name' => $validated['last_name'],
                    'nickname' => $validated['nickname'],
                    'gender' => $validated['gender'],
                    'age' => $validated['age'] ?: $this->calculateAge($validated['date_of_birth']),
                    'family_rank' => $validated['family_rank'],
                    'citizenship' => $validated['citizenship'],
                    'country' => $validated['citizenship'] === 'Non Indonesia' ? $validated['country'] : 'Indonesia',
                    'religion' => $validated['religion'],
                    'place_of_birth' => $validated['place_of_birth'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'email' => $validated['email'],
                    'previous_school' => $validated['previous_school'],
                    'phone_number' => $validated['phone_number'],
                    'academic_status' => $validated['academic_status'],
                    'academic_status_other' => $validated['academic_status'] === 'OTHER' ? $validated['academic_status_other'] : null,
                    'registration_date' => $draft->registration_date_draft,
                    'active' => 'YES',
                    'status' => 'Not Graduate',
                    'nik' => $validated['nik'],
                    'kitas' => $validated['kitas'],
                    'nisn' => $validated['nisn'],
                ]);

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
                    'status' => $enrollmentStatus,
                    'student_status' => $validated['student_status'],
                ]);
                
                // Create application form
                $applicationForm = $this->createApplicationForm($enrollment);
                event(new ApplicationFormCreated($applicationForm));

                // Create application form version
                $applicationFormVersion = $this->createApplicationFormVersion($applicationForm, $validated, $student, $enrollment);

                // Create student address, parent, guardian for new student
                $this->createStudentRelatedData($student, $validated, $enrollment);
                
            } else if ($status === 'Old') {
                $existingStudentId = $validated['input_name'];
                $source = $request->input('source');

                if (!$existingStudentId) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student ID is required for Old student'
                    ], 422);
                }
                
                if ($source === 'new') {
                    $student = Student::find($existingStudentId);
                    if (!$student) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Student not found'
                        ], 404);
                    }

                    $sameSection = $student->enrollments()
                        ->where('section_id', $validated['section_id'])
                        ->exists();

                    if (!$sameSection) {
                        return response()->json([
                            'success' => false,
                            'error' => 'For different section, please register as New Student.'
                        ], 422);
                    }

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
                        'status' => $enrollmentStatus,
                        'student_status' => 'Old',
                    ]);
                    // Create application form
                    $applicationForm = $this->createApplicationForm($enrollment);
                    event(new ApplicationFormCreated($applicationForm));

                    // Create application form version
                    $applicationFormVersion = $this->createApplicationFormVersion($applicationForm, $validated, $student, $enrollment);

                    if ($student->status !== 'Graduate') {
                        $student->active = 'YES';
                        $student->status = 'Not Graduate';
                        $student->save();
                    }

                    $this->updateStudentData($student, $validated, $registrationId, $draft);
                    
                    $this->updateStudentRelatedData($student, $validated, $enrollment);
                } else if ($source === 'old') {
                    $oldStudent = StudentOld::find($existingStudentId);
                    if (!$oldStudent) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Old student data not found'
                        ], 404);
                    }

                    $generatedId = $this->generateStudentId(
                        $draft->school_year_id,  
                        $validated['section_id'], 
                        $validated['major_id']
                    );

                    $student = Student::create([
                        'student_id' => $generatedId,
                        'first_name' => $validated['first_name'] ?? $oldStudent->first_name,
                        'middle_name' => $validated['middle_name'] ?? $oldStudent->middle_name,
                        'last_name' => $validated['last_name'] ?? $oldStudent->last_name,
                        'nickname' => $validated['nickname'] ?? $oldStudent->nickname,
                        'gender' => $validated['gender'] ?? strtoupper($oldStudent->gender),
                        'age' => $validated['age'] ?: $this->calculateAge($validated['date_of_birth']),
                        'family_rank' => $validated['family_rank'] ?? '',
                        'citizenship' => $validated['citizenship'] ?? 'Indonesia',
                        'country' => $validated['citizenship'] === 'Non Indonesia' ? $validated['country'] : 'Indonesia',
                        'religion' => $validated['religion'] ?? $oldStudent->religion,
                        'place_of_birth' => $validated['place_of_birth'] ?? $oldStudent->place_of_birth,
                        'date_of_birth' => $validated['date_of_birth'] ?? $oldStudent->date_of_birth,
                        'email' => $validated['email'] ?? $oldStudent->student_email,
                        'previous_school' => $validated['previous_school'] ?? $oldStudent->previous_school,
                        'phone_number' => $validated['phone_number'] ?? $oldStudent->student_phone,
                        'academic_status' => $validated['academic_status'],
                        'academic_status_other' => $validated['academic_status_other'] ?? null,
                        'registration_date' => $draft->registration_date_draft,
                        'active' => 'YES',
                        'status' => 'Not Graduate',
                        'nik' => $validated['nik'] ?? $oldStudent->nik,
                        'nisn' => $validated['nisn'] ?? $oldStudent->nisn,
                    ]);

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
                        'status' => $enrollmentStatus,
                        'student_status' => 'Old',
                    ]);

                    $applicationForm = $this->createApplicationForm($enrollment);
                    event(new ApplicationFormCreated($applicationForm));

                    $applicationFormVersion = $this->createApplicationFormVersion($applicationForm, $validated, $student, $enrollment);

                    $this->createStudentRelatedData($student, $validated, $enrollment);
                }
                
            }
            
            // Clear draft
            $draft->delete();
            
            $this->auditTrail->log('registration', [
                'student_id' => $student->student_id,
                'changes'    => $validated,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Registration submitted successfully.',
                'data' => [
                    'student_id' => $student->student_id,
                    'registration_id' => $registrationId,
                    'application_id' => $applicationForm->application_id,
                    'version' => $applicationFormVersion->version_id,
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

    public function showPreview($applicationId, $versionId)
    {
        try {
            \Log::info('Preview called', [
                'application_id' => $applicationId,
                'version_id' => $versionId
            ]);

            // Query base
            $version = ApplicationFormVersion::where('application_id', $applicationId)
                ->where('version_id', $versionId)
                ->firstOrFail();

            \Log::info('Version found:', [
                'version_id' => $version->version_id,
                'application_id' => $applicationId
            ]);

            $snapshot = json_decode($version->data_snapshot, true);

            return response()->json([
                'success' => true,
                'message' => 'Preview data retrieved successfully',
                'data' => $snapshot
            ], 200, [], JSON_PRETTY_PRINT);

        } catch (\Exception $e) {
            \Log::error('Preview failed', [
                'application_id' => $applicationId,
                'version_id' => $versionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Preview failed: ' . $e->getMessage()
            ], 500);
        }
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
        $student->studentAddress()->create([
            'street' => $validated['street'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'village' => $validated['village'],
            'district' => $validated['district'],
            'city_regency' => $validated['city_regency'],
            'province' => $validated['province'],
            'other' => $validated['other'],
            'enrollment_id' => $enrollment->enrollment_id,
        ]);
        
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
            'enrollment_id' => $enrollment->enrollment_id,
        ]);
        
        $this->createParentAddresses($studentParent, $validated, $enrollment);
        $this->createGuardianData($student, $validated, $enrollment);
        $this->createPayment($student, $validated, $enrollment);
    }

    private function createParentAddresses($studentParent, $validated, $enrollment)
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
            'enrollment_id' => $enrollment->enrollment_id,
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
            'enrollment_id' => $enrollment->enrollment_id,
        ]);
    }

    private function createGuardianData($student, $validated, $enrollment)
    {
        $guardian = Guardian::create([
            'guardian_name' => $validated['guardian_name'],
            'relation_to_student' => $validated['relation_to_student'],
            'phone_number' => $validated['guardian_phone'],
            'guardian_email' => $validated['guardian_email'],
        ]);
        $studentGuardian = $student->studentGuardian()->create([
            'guardian_id' => $guardian->guardian_id,
            'enrollment_id' => $enrollment->enrollment_id,
        ]);
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
            'enrollment_id'=> $enrollment->enrollment_id,
            'tuition_fees' => $validated['tuition_fees'],
            'residence_payment' => $validated['residence_payment'],
            'financial_policy_contract' => $validated['financial_policy_contract'],
        ]);

        if ($validated['discount_name']) {
            $discountType = DiscountType::firstOrCreate(['name' => $validated['discount_name']]);
            $enrollment->studentDiscount()->create([
                'enrollment_id' => $enrollment->enrollment_id,
                'discount_type_id' => $discountType->discount_type_id,
                'notes' => $validated['discount_notes'],
            ]);
        }  
    }

    private function updateStudentData($student, $validated, $registrationId, $draft)
    {
        $student->update([
            'registration_id' => $registrationId,
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'nickname' => $validated['nickname'],
            'gender' => $validated['gender'],
            'age' => $validated['age'] ?: $this->calculateAge($validated['date_of_birth']),
            'family_rank' => $validated['family_rank'],
            'citizenship' => $validated['citizenship'],
            'country' => $validated['citizenship'] === 'Non Indonesia' ? $validated['country'] : 'Indonesia',
            'religion' => $validated['religion'],
            'place_of_birth' => $validated['place_of_birth'],
            'date_of_birth' => $validated['date_of_birth'],
            'email' => $validated['email'],
            'previous_school' => $validated['previous_school'],
            'phone_number' => $validated['phone_number'],
            'academic_status' => $validated['academic_status'],
            'academic_status_other' => $validated['academic_status'] === 'OTHER' ? $validated['academic_status_other'] : null,
            'status' => 'Not Graduate',
            'active' => 'YES',
            'nik' => $validated['nik'],
            'kitas' => $validated['kitas'],
            'nisn' => $validated['nisn'],
        ]);
    }

    private function updateStudentRelatedData($student, $validated, $enrollment)
    {
        $student->studentAddress()->updateOrCreate(
            [
                'student_id' => $student->student_id,
                'enrollment_id' => $enrollment->enrollment_id,
            ],
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
        
        $student->studentParent()->updateOrCreate(
            [
                'student_id' => $student->student_id,
                'enrollment_id' => $enrollment->enrollment_id, 
            ],
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
            ]
        );
        
        $this->updateParentAddresses($student, $validated, $enrollment);
        $this->updateGuardianData($student, $validated, $enrollment);
        $this->updatePayment($student, $validated, $enrollment);
    }

    private function updateParentAddresses($student, $validated, $enrollment)
    {
        $studentParent = $student->studentParent;
        
        if ($studentParent) {
            $studentParent->fatherAddress()->updateOrCreate(
                [
                    'parent_id' => $studentParent->parent_id,
                    'enrollment_id' => $enrollment->enrollment_id,
                ],
                [
                    'street' => $validated['father_address_street'],
                    'rt' => $validated['father_address_rt'],
                    'rw' => $validated['father_address_rw'],
                    'village' => $validated['father_address_village'],
                    'district' => $validated['father_address_district'],
                    'city_regency' => $validated['father_address_city_regency'],
                    'province' => $validated['father_address_province'],
                    'other' => $validated['father_address_other'],
                ]
            );

            $studentParent->motherAddress()->updateOrCreate(
                [
                    'parent_id' => $studentParent->parent_id,
                    'enrollment_id' => $enrollment->enrollment_id,
                ],
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

    private function updateGuardianData($student, $validated, $enrollment)
    {
        $guardian = Guardian::updateOrCreate(
            [
                'guardian_id' => $validated['guardian_id'] ?? null
            ],
            [
                'guardian_name' => $validated['guardian_name'],
                'relation_to_student' => $validated['relation_to_student'],
                'phone_number' => $validated['guardian_phone'],
                'guardian_email' => $validated['guardian_email'],
            ]
        );
        $studentGuardian = $student->studentGuardian()->updateOrCreate(
            [
                'student_id' => $student->student_id,
                'guardian_id' => $guardian->guardian_id,
                'enrollment_id' => $enrollment->enrollment_id,
            ]
        );
        $guardian->guardianAddress()->updateOrCreate(
            [
                'guardian_id' => $guardian->guardian_id,
            ],
            [
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
        Payment::updateOrCreate(
        [
            'student_id' => $student->student_id,
            'enrollment_id' => $enrollment->enrollment_id,
        ],
        [
            'student_id' => $student->student_id,
            'enrollment_id'=> $enrollment->enrollment_id,
            'tuition_fees' => $validated['tuition_fees'],
            'residence_payment' => $validated['residence_payment'],
            'financial_policy_contract' => $validated['financial_policy_contract'],
        ]);

        if ($validated['discount_name']) {
            $discountType = DiscountType::updateOrCreate(['name' => $validated['discount_name']]);
            $enrollment->studentDiscount()->updateOrCreate(
                [
                    'enrollment_id' => $enrollment->enrollment_id,
                ],
                [
                    'discount_type_id' => $discountType->discount_type_id,
                    'notes' => $validated['discount_notes'],
                ]
            );
        }
    }

    private function createApplicationForm($enrollment)
    {
        return ApplicationForm::create([
            'enrollment_id' => $enrollment->enrollment_id,
            'is_invalid_data' => false,
            'status' => 'Confirmed',
            'submitted_at' => now(),
        ]);
    }

    private function createApplicationFormVersion($applicationForm, $validated, $student, $enrollment)
    {
        $latestVersion = ApplicationFormVersion::whereHas('applicationForm.enrollment.student', function($q) use ($student) {
            $q->where('student_id', $student->student_id);
        })
        ->orderByDesc('version_id')
        ->first();

        $oldSnapshot = $latestVersion ? json_decode($latestVersion->data_snapshot, true) : [];
        $oldRequestData = $oldSnapshot['request_data'] ?? [];

        $newRequestData = array_merge($oldRequestData, $validated, [
            'student_active' => $student->active,          
            'status' => $student->status,
            'enrollment_status' => $enrollment->status,
            'application_form_status' => $applicationForm->status, 
            'school_year_id'          => $enrollment->school_year_id,
            'school_year'             => $enrollment->schoolYear->year,
        ]);

        unset($newRequestData['photo']);
        
        if ($student->photo_path) {
            $newRequestData['photo_path'] = $student->photo_path;
            $newRequestData['photo_url']  = asset('storage/' . $student->photo_path);
        }

        $dataSnapshot = [
            'student_id'     => $student->student_id,
            'registration_id'=> $enrollment->registration_id,
            'enrollment_id'  => $enrollment->enrollment_id,
            'registration_number' => $enrollment->enrollment_id,
            'registration_date'   => $enrollment->registration_date,
            'application_id' => $applicationForm->application_id,
            'semester'       => $enrollment->semester->number, 
            'school_year'    => $enrollment->schoolYear->year, 
            'request_data'   => $newRequestData,
            'timestamp'      => now(),
            'action'         => 'registration'
        ];

        $maxVersion = ApplicationFormVersion::where('application_id', $applicationForm->application_id)
            ->max('version');
        
        $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
        $userName = auth()->user()->username ?? 'system';

        return ApplicationFormVersion::create([
            'application_id' => $applicationForm->application_id,
            'version'        => $nextVersion,
            'updated_by'     => $userName,
            'action'         => 'registration',
            'data_snapshot'  => json_encode($dataSnapshot, JSON_PRETTY_PRINT),
        ]);
    }
}
