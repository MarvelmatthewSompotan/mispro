<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\DiscountType;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationFormVersion;

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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                // student
                'student_status' => 'required|in:New,Old,Transferee',
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
                'age' => 'required|integer',

                // student address
                'street' => 'required|string',
                'rt' => 'nullable|string',
                'rw' => 'nullable|string',
                'village' => 'required|string',
                'district' => 'required|string',
                'city_regency' => 'required|string',
                'province' => 'required|string',
                'other' => 'nullable|text',

                // program, class, major
                'section_id' => 'required|exists:sections,section_id',
                'program_id' => 'required|exists:programs,program_id',
                'grade' => 'required|integer',
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
                'father_address_other' => 'nullable|text',

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
                'mother_address_other' => 'nullable|text',

                // student parent (guardian)
                'guardian_name' => 'nullable|string',
                'relation_to_student' => 'nullable|string',
                'phone_number' => 'nullable|string',
                'guardian_email' => 'nullable|email',
                'guardian_address_street' => 'nullable|string',
                'guardian_address_rt' => 'nullable|string',
                'guardian_address_rw' => 'nullable|string',
                'guardian_address_village' => 'nullable|string',
                'guardian_address_district' => 'nullable|string',
                'guardian_address_city_regency' => 'nullable|string',
                'guardian_address_province' => 'nullable|string',
                'guardian_address_other' => 'nullable|text',
                
                // payment
                'payment_type' => 'required|in:Tuition Fee,Residence Hall',
                'payment_method' => 'required|in:Full Payment,Installment',
                'financial_policy_contract' => 'required|in:Signed,Not Signed',

                // discount
                'discount_name' => 'nullable|string',
                'discount_notes' => 'nullable|text',
                
                // school year, semester, registration date
                'school_year_id' => 'required|integer',
                'semester_id' => 'required|integer',
                'registration_date' => 'required|date',

            ]);
            
            // data master
            $section = Section::findOrFail($validated['section_id']);
            $program = Program::findOrFail($validated['program_id']);
            $major = Major::findOrFail($validated['major_id']);
            $transportation = Transportation::findOrFail($validated['transportation_id']);
            $residenceHall = ResidenceHall::findOrFail($validated['residence_id']);

            // program 
            if ($program->name == 'Other') {
                $program->other = $validated['program_other'];
                $program->save();
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

            // student
            $student = Student::create([
                'student_status' => $validated['student_status'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name' => $validated['last_name'],
                'nickname' => $validated['nickname'],
                'gender' => $validated['gender'],
                'age' => $validated['age'],
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

            // school class
            $schoolClass = SchoolClass::firstOrCreate([
                'grade' => $validated['grade'],
                'section_id' => $section->section_id,
                'major_id' => $major->major_id,
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

            // data application form
            $nextVersion = ApplicationForm::where('student_id', $student->student_id)->max('version') + 1;
            $applicationForm = ApplicationForm::create([
                'enrollment_id' => $enrollment->enrollment_id,
                'status' => 'Submitted',
                'submitted_at' => now(),
                'version' => $nextVersion,
                'created_at' => now(),
                'student_id' => $student->student_id,
            ]);

            // data application form version
            ApplicationFormVersion::create([
                'application_id' => $applicationForm->application_id,
                'version' => 1,
                'updated_by' => 'system',
                'data_snapshot' => json_encode($validated),
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Registration completed successfully'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
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
