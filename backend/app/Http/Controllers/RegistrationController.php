<?php

namespace App\Http\Controllers;

use session;
use Carbon\Carbon;
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
use App\Models\DiscountType;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationFormVersion;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ApplicationPreviewResource;


class RegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Start registration process with initial context
     */
    public function startRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_year' => 'required|string',
            'end_year' => 'required|string',
            'semester_id' => 'required|integer|exists:semesters,semester_id',
            'registration_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        session([
            'registration_context' => $validated
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Initial registration context saved successfully.',
            'data' => $validated
        ], 200);
    }

    /**
     * Get current registration context
     */
    public function getRegistrationContext()
    {
        $context = session('registration_context');

        if (!$context) {
            return response()->json([
                'success' => false,
                'error' => 'No registration context found. Please complete Step 1 first.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $context
        ], 200);
    }

    /**
     * Clear registration context
     */
    public function clearRegistrationContext()
    {
        session()->forget('registration_context');

        return response()->json([
            'success' => true,
            'message' => 'Registration context cleared successfully.'
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
                ->where('classes.section_id', $section_id)
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

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            // $context = session('registration_context');

            // if (!$context) {
            //     return response()->json([
            //         'success' => false,
            //         'error' => 'No registration context found. Please complete Step 1 first.'
            //     ], 400);
            // }

            // validate request
            $validated = $request->validate([
                // student
                'student_status' => 'required|in:New,Old,Transferee',
                'input_name' => [
                    'required_if:student_status,Old',
                    'string',
                    'exists:students,student_id',
                ],
                'first_name' => 'required|string',
                'middle_name' => 'nullable|string',
                'last_name' => 'required|string',
                'nickname' => 'nullable|string',
                'citizenship' => 'required|string',
                'religion' => 'required|string',
                'place_of_birth' => 'required|string',
                'date_of_birth' => 'required|date',
                'email' => 'nullable|email',
                'phone_number' => 'nullable|string',
                'previous_school' => 'required|string',
                'academic_status' => 'required|in:REGULAR,SIT-IN,OTHER',
                'gender' => 'required|in:MALE,FEMALE',
                'family_rank' => 'required|string',
                'nisn' => 'required|string',
                'nik' => 'required|numeric',
                'kitas' => 'required|string',

                // student address
                'street' => 'required|string',
                'rt' => 'nullable|string',
                'rw' => 'nullable|string',
                'village' => 'required|string',
                'district' => 'required|string',
                'city_regency' => 'required|string',
                'province' => 'required|string',
                'other' => 'nullable|string',

                // program, class, major
                'section_id' => 'required|exists:sections,section_id',
                'program_id' => 'required|exists:programs,program_id',
                'class_id' => 'required|exists:classes,class_id',
                'major_id' => 'required|exists:majors,major_id',
                'program_other' => function ($attribute, $value, $fail) use ($request) {
                    $program = Program::find($request->input('program_id'));
                    if ($program && $program->name === 'Other' && empty($value)) {
                        $fail('The program_other field is required when selecting "Other" as the program.');
                    }
                },
                
                // Facilities
                'transportation_id' => 'required|exists:transportations,transport_id',
                'pickup_point' => 'nullable|string',
                'transportation_policy' => 'required|in:Signed,Not Signed',
                'residence_id' => 'required|exists:residence_halls,residence_id',
                'residence_hall_policy' => 'required|in:Signed,Not Signed',

                // student parent (father)
                'father_name' => 'nullable|string',
                'father_company' => 'nullable|string',
                'father_occupation' => 'nullable|string',
                'father_phone' => 'nullable|string',
                'father_email' => 'nullable|email',
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
                'mother_email' => 'nullable|email',
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
                'guardian_email' => 'nullable|email',
                'guardian_address_street' => 'nullable|string',
                'guardian_address_rt' => 'nullable|string',
                'guardian_address_rw' => 'nullable|string',
                'guardian_address_village' => 'nullable|string',
                'guardian_address_district' => 'nullable|string',
                'guardian_address_city_regency' => 'nullable|string',
                'guardian_address_province' => 'nullable|string',
                'guardian_address_other' => 'nullable|string',
                
                // payment
                'payment_type' => 'required|in:Tuition Fee,Residence Hall',
                'payment_method' => 'required|in:Full Payment,Installment',
                'financial_policy_contract' => 'required|in:Signed,Not Signed',

                // discount
                'discount_name' => 'nullable|string',
                'discount_notes' => 'nullable|string',

                // create
                'school_year_id' => 'required|integer',
                'semester_id' => 'required|integer',
                'registration_date' => 'required|date'
            ]);
            
            // Merge context with validated data
            // $validated = array_merge($validated, $context);
            
            // data master
            $section = Section::findOrFail($validated['section_id']);
            $program = Program::findOrFail($validated['program_id']);
            $major = Major::findOrFail($validated['major_id']);
            $schoolClass = SchoolClass::findOrFail($validated['class_id']);
            $transportation = Transportation::findOrFail($validated['transportation_id']);
            $residenceHall = ResidenceHall::findOrFail($validated['residence_id']);

            // program 
            if ($program->name == 'Other' && !empty($validated['program_other'])) {
                $customProgram = Program::firstOrCreate(['name' => $validated['program_other']]);
                $program = $customProgram; 
            }

            // pickup point 
            $pickupPoint = null;
            if ($validated['pickup_point']) {
                $pickupPoint = PickupPoint::firstOrCreate([
                    'name' => $validated['pickup_point'],
                ]);
                $transportation->pickup_point_id = $pickupPoint->pickup_point_id;
                $transportation->save();
            }

            // registration id
            $number = $this->getSectionRegistrationNumber($validated['section_id'], $validated['registration_date']);
            $registrationId = $this->formatRegistrationId(
                $number,
                $validated['section_id'],
                $validated['registration_date']
            );
            
            // student
            $status = $validated['student_status'];
            if ($status === 'New'|| $status === 'Transferee') {
                $existingStudent = Student::where('first_name', $validated['first_name'])
                ->where('middle_name', $validated['middle_name'])
                ->where('last_name', $validated['last_name'])
                ->where('date_of_birth', $validated['date_of_birth'])
                ->where('place_of_birth', $validated['place_of_birth'])
                ->where('previous_school', $validated['previous_school'])
                ->first();
                if ($existingStudent) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student already exists, please select Old status and input student name'
                    ], 422);
                } 
                $generatedId = $this->generateStudentId(
                    $validated['school_year_id'],  
                    $validated['section_id'], 
                    $validated['major_id']
                );
            } else if ($status === 'Old') {
                $generatedId = $validated['input_name'] ?? null;
                if (!$generatedId) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Student name is required for Old student'
                    ], 422);
                }
            }

            // calculate age
            $dateOfBirth = Carbon::parse($validated['date_of_birth']);
            $diff = $dateOfBirth->diff(Carbon::now());
            $calculatedAge = "{$diff->y} years {$diff->m} months";
            
            $student = Student::create([
                'student_id' => $generatedId,
                'student_status' => $validated['student_status'],
                'registration_id' => $registrationId,
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name' => $validated['last_name'],
                'nickname' => $validated['nickname'],
                'gender' => $validated['gender'],
                'age' => $calculatedAge,
                'family_rank' => $validated['family_rank'],
                'citizenship' => $validated['citizenship'],
                'religion' => $validated['religion'],
                'place_of_birth' => $validated['place_of_birth'],
                'date_of_birth' => $validated['date_of_birth'],
                'email' => $validated['email'],
                'previous_school' => $validated['previous_school'],
                'phone_number' => $validated['phone_number'],
                'academic_status' => $validated['academic_status'],
                'registration_date' => $validated['registration_date'],
                'enrollment_status' => 'ACTIVE',
            ]);

            // enrollment
            $enrollment = $student->enrollments()->create([
                'class_id' => $schoolClass->class_id,
                'semester_id' => $validated['semester_id'],
                'school_year_id' => $validated['school_year_id'],
                'program_id' => $program->program_id,
                'transport_id' => $transportation->transport_id,
                'residence_id' => $residenceHall->residence_id,
                'residence_hall_policy' => $validated['residence_hall_policy'], 
                'transportation_policy' => $validated['transportation_policy'],
                'is_active' => true,
            ]);

            // data application form
            $enrollmentIdS = $student->enrollments()->pluck('enrollment_id');
            $maxVersion = ApplicationForm::whereIn('enrollment_id', $enrollmentIdS)->max('version');
            $nextVersion = $maxVersion ? $maxVersion + 1 : 1;
            $applicationForm = ApplicationForm::create([
                'enrollment_id' => $enrollment->enrollment_id,
                'status' => 'Submitted',
                'submitted_at' => now(),
                'version' => $nextVersion,
                'created_at' => now(),
            ]);


            // student address
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

            // student parent & address
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
            ]);
            $studentParent->fatherAddress()->create([
                'street' => $validated['father_address_street'],
                'rt' => $validated['father_address_rt'],
                'rw' => $validated['father_address_rw'],
                'village' => $validated['father_address_village'],
                'district' => $validated['father_address_district'],
                'city_regency' => $validated['father_address_city_regency'],
                'province' => $validated['father_address_province'],
                'other' => $validated['father_address_other'],
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

            // guardian & address
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


            // payment
            Payment::create([
                'student_id' => $student->student_id,
                'type' => $validated['payment_type'],
                'method' => $validated['payment_method'],
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

            // data application form version
            $dataSnapshot = [
                'student_id' => $student->student_id,
                'enrollment_id' => $enrollment->enrollment_id,
                'application_id' => $applicationForm->application_id,
                'request_data' => $validated,
            ];
            ApplicationFormVersion::create([
                'application_id' => $applicationForm->application_id,
                'version' => 1,
                'updated_by' => 'system',
                'data_snapshot' => json_encode($dataSnapshot, JSON_PRETTY_PRINT),
            ]);

            // Clear session after successful registration
            session()->forget('registration_context');

            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Registration completed successfully',
                'data' => [
                    'student_id' => $student->student_id,
                    'registration_id' => $registrationId,
                    'application_id' => $applicationForm->application_id,
                    'enrollment_id' => $enrollment->enrollment_id
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'error' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showPreview($applicationId)
    {
        try {
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
            
            return response()->json([
                'success' => true,
                'message' => 'Preview data saved to session',
                'data' => new ApplicationPreviewResource($application)
            ], 200);
        } catch (\Exception $e) {
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
}
