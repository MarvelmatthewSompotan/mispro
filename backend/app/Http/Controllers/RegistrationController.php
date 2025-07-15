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
                'student.first_name' => 'required|string',
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
                ]
            ));

            // data discount
            $discountType = DiscountType::findOrFail([
                'name' => $request->input('discount_type.name')
            ]);
            $studentDiscount = $enrollment->studentDiscount()->create([
                'discount_type_id' => $discountType->discount_type_id,
            ]);

            // data residence
            $residenceHall->policy_signed = $request->input('residence_policy_signed');
            $residenceHall->save();

            // data transportation
            $transportation->policy_signed = $request->input('transport_policy_signed');
            $transportation->save();

            // data payment
            $payment = Payment::create([
                'student_id' => $student->student_id,
                'type' => $request->input('payment_type'),
                'method' => $request->input('payment_method'),
                'policy_signed' => $request->input('payment_policy_signed') ? 'SIGNED' : 'NOT SIGNED'
            ]);

            // data application form
            $applicationForm = ApplicationForm::create([
                'enrollment_id' => $enrollment->enrollment_id,
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
                'version' => 1,
                'created_at' => now(),
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
