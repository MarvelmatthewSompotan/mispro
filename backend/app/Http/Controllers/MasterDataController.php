<?php

namespace App\Http\Controllers;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
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
        $classes = SchoolClass::with(['section', 'major'])->get()->map(function ($class){
            return [
                'class_id' => $class->class_id,
                'grade' => $class->grade,
                'section_id' => $class->section_id,
                'section_name' => $class->section->name,
                'major_id' => $class->major_id,
                'major_name' => $class->major->name,
            ];
        });
        
        $pickupPoints = PickupPoint::select('pickup_point_id', 'name')->get();
        
        return response()->json([
            'sections' => $sections,
            'majors' => $majors,
            'classes' => $classes,
            'programs' => Program::all(),
            'transportations' => Transportation::select('transport_id', 'type')->get(),
            'residence_halls' => ResidenceHall::all(),
            'discount_types' => DiscountType::select('discount_type_id', 'name')->get(),
            'student_status' => ['New', 'Old', 'Transferee'],
            'academic_status' => ['REGULAR', 'SIT-IN', 'OTHER'],
            'gender' => ['MALE', 'FEMALE'],
            'transportation_policy' => ['Signed', 'Not Signed'],
            'residence_hall_policy' => ['Signed', 'Not Signed'],
            'payment_type' => ['Tuition Fee', 'Residence Hall'],
            'payment_method' => ['Full Payment', 'Installment'],
            'financial_policy_contract' => ['Signed', 'Not Signed'],
            'pickup_points' => $pickupPoints,
        ]);
    }
}
