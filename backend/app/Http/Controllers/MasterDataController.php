<?php

namespace App\Http\Controllers;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use App\Models\SchoolYear;
use App\Models\PickupPoint;
use App\Models\SchoolClass;
use App\Models\DiscountType;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;

class MasterDataController extends Controller
{
    public function getRegistrationOption()
    {
        $sections = Section::select('section_id', 'name')->get();
        $majors = Major::select('major_id', 'name')->get();
        $classes = SchoolClass::select('class_id', 'grade')->get();
        
        $pickupPoints = PickupPoint::select('pickup_point_id', 'name')->get();
        
        return response()->json([
            'sections' => $sections,
            'majors' => $majors,
            'classes' => $classes,
            'programs' => Program::select('program_id', 'name')->get(),
            'school_years' => SchoolYear::select('school_year_id', 'year')->get(),
            'semesters' => Semester::select('semester_id', 'name')->get(),
            'transportations' => Transportation::select('transport_id', 'type')->get(),
            'residence_halls' => ResidenceHall::select('residence_id', 'type')->get(),
            'discount_types' => DiscountType::select('discount_type_id', 'name')->get(),
            'student_status' => ['New', 'Old', 'Transferee'],
            'academic_status' => ['REGULAR', 'SIT-IN', 'OTHER'],
            'tuition_fees' => ['Full Payment', 'Installment'],
            'residence_payment' => ['Full Payment', 'Installment'],
            'financial_policy_contract' => ['Signed', 'Not Signed'],
            'inactive_status' => ['GRADUATE', 'TRANSFEREE', 'EXPELLED'],
            'pickup_points' => $pickupPoints,
        ]);
    }
}
