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
            $request->validate([
                // student
                'students.student_status' => 'required|string',
                'students.first_name' => 'required|string',
                'students.middle_name' => 'nullable|string',
                'students.last_name' => 'required|string',
                'students.nickname' => 'nullable|string',
                'students.citizenship' => 'required|string',
                'students.religion' => 'required|string',
                'students.place_of_birth' => 'required|string',
                'students.date_of_birth' => 'required|date',
                'students.email' => 'nullable|email',
                'students.phone_number' => 'nullable|string',
                'students.previous_school' => 'required|string',
                'students.academic_status' => 'required|string',
                'students.gender' => 'required|string',
                'students.family_rank' => 'required|string',

                // student address
                'student_addresses.street' => 'required|string',
                'student_addresses.rt' => 'nullable|string',
                'student_addresses.rw' => 'nullable|string',
                'student_addresses.village' => 'required|string',
                'student_addresses.district' => 'required|string',
                'student_addresses.city_regency' => 'required|string',
                'student_addresses.province' => 'required|string',
                'student_addresses.other' => 'nullable|text',

                // section
                'sections.name' => 'required|string',

                // class
                'classes.grade' => 'required|integer',

                // program
                'programs.name' => 'required|string',
                
                // transportation
                'transportations.type' => 'required|string',
                // 'transportations.pickup_point_id' => 'required|integer',
                
                // pickup point

                // residence
                'residence_halls.type' => 'required|string',

                // policy
                
                // student parent (father)
                'parents.father_name' => 'nullable|string',
                'parents.father_company' => 'nullable|string',
                'parents.father_occupation' => 'nullable|string',
                'parents.father_phone' => 'nullable|string',
                'parents.father_email' => 'nullable|email',
                'father_addresses.street' => 'nullable|string',
                'father_addresses.rt' => 'nullable|string',
                'father_addresses.rw' => 'nullable|string',
                'father_addresses.village' => 'nullable|string',
                'father_addresses.district' => 'nullable|string',
                'father_addresses.city_regency' => 'nullable|string',
                'father_addresses.province' => 'nullable|string',
                'father_addresses.other' => 'nullable|text',

                // student parent (mother)
                'parents.mother_name' => 'nullable|string',
                'parents.mother_company' => 'nullable|string',
                'parents.mother_occupation' => 'nullable|string',
                'parents.mother_phone' => 'nullable|string',
                'parents.mother_email' => 'nullable|email',
                'mother_addresses.street' => 'nullable|string',
                'mother_addresses.rt' => 'nullable|string',
                'mother_addresses.rw' => 'nullable|string',
                'mother_addresses.village' => 'nullable|string',
                'mother_addresses.district' => 'nullable|string',
                'mother_addresses.city_regency' => 'nullable|string',
                'mother_addresses.province' => 'nullable|string',
                'mother_addresses.other' => 'nullable|text',

                // student parent (guardian)
                'guardians.guardian_name' => 'nullable|string',
                'guardians.relation_to_student' => 'nullable|string',
                'guardians.phone_number' => 'nullable|string',
                // 'guardians.email' => 'nullable|email',
                'guardian_addresses.street' => 'nullable|string',
                'guardian_addresses.rt' => 'nullable|string',
                'guardian_addresses.rw' => 'nullable|string',
                'guardian_addresses.village' => 'nullable|string',
                'guardian_addresses.district' => 'nullable|string',
                'guardian_addresses.city_regency' => 'nullable|string',
                'guardian_addresses.province' => 'nullable|string',
                'guardian_addresses.other' => 'nullable|text',
                
                // payment
                'payments.type' => 'required|string',
                'payments.method' => 'required|string',
                'payments.financial_policy_contract' => 'required|string',

                // discount
                'discount_types.name' => 'nullable|string',
                'discount_types.notes' => 'nullable|text',

                // enrollments
                'enrollments.is_active' => 'required|boolean',

                // application form
                'application_forms.status' => 'required|string',
                'application_forms.version' => 'required|integer',

                // application form version
                'application_form_versions.version' => 'required|integer',
                'application_form_versions.updated_by' => 'required|string',
                'application_form_versions.data_snapshot' => 'required|json',
            ]);
            
            // data master
            $section = Section::findOrFail($request->input('section_id'));
            $program = Program::findOrFail($request->input('enrollment.program_id'));
            $transportation = Transportation::findOrFail($request->input('enrollment.transport_id'));
            $schoolClass = SchoolClass::findOrFail($request->input('enrollment.class_id'));
            $residenceHall = ResidenceHall::findOrFail($request->input('enrollment.residence_id'));
            $payment = Payment::findOrFail($request->input('payment_id'));

            // data student
            $student = Student::create($request->input('student'));
            $student->studentAddress()->create($request->input('student_address'));
            
            // data parent
            $studentParent = $student->studentParent()->create($request->input('student_parent'));
            $studentParent->fatherAddress()->create($request->input('father_address'));
            $studentParent->motherAddress()->create($request->input('mother_address'));
            
            // data guardian
            $guardian = Guardian::create($request->input('guardian'));
            $studentGuardian = $student->studentGuardian()->create(['guardian_id' => $guardian->guardian_id]);
            $guardian->guardianAddress()->create($request->input('guardian_address'));

            // data enrollment
            $enrollment = $student->enrollments()->create(array_merge(
                $request->input('enrollment'),
                [
                    'program_id' => $program->program_id,
                    'transport_id' => $transportation->transport_id,
                    'class_id' => $schoolClass->class_id,
                    'residence_id' => $residenceHall->residence_id,
                    'is_active' => true,
                ]
            ));

            // data discount
            if ($request->filled('discount_type.name')) {
                $discountType = DiscountType::where('name', $request->input('discount_type.name'))->firstOrFail();
                $enrollment->studentDiscount()->create([
                    'discount_type_id' => $discountType->discount_type_id,
                ]);
            }

            // data policy signed

            // data payment
            $payment = Payment::create([
                'student_id' => $student->student_id,
                'type' => $request->input('payment_type'),
                'method' => $request->input('payment_method'),
                'policy_signed' => $request->input('payment_policy_signed') ? 'SIGNED' : 'NOT SIGNED'
            ]);


            // data application form
            $nextVersion = ApplicationForm::where('student_id', $student->student_id)->max('version') + 1;
            $applicationForm = ApplicationForm::create([
                'enrollment_id' => $enrollment->enrollment_id,
                'status' => 'SUBMITTED',
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
                'data_snapshot' => json_encode($request->all()),
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
