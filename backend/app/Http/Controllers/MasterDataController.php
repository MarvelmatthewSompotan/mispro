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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MasterDataController extends Controller
{
    public function addSchoolYear()
    {
        DB::beginTransaction();
        try {
            $lastSchoolYear = SchoolYear::orderByDesc('school_year_id')->lockForUpdate()->first(); 

            if (!$lastSchoolYear) {
                $newYear = date('Y') . '/' .(date('Y') + 1);
            } else {
                [$startYear,  $endYear] = explode('/', $lastSchoolYear->year);
                $nextStart = (int)$startYear + 1;
                $nextEnd = (int)$endYear + 1;
                $newYear = $nextStart . '/' . $nextEnd;
            }
    
            $schoolYear = SchoolYear::create([
                'year' => $newYear,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'New school year added successfully.',
                'school_year' => $schoolYear,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('MasterData Add SchoolYear Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add school year due to a server error.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function getRegistrationOption(Request $request)
    {
        try {
            $only = $request->query('only');

            $only = $only ? explode(',', $only) : [];

            $data = [];

            if (empty($only) || in_array('sections', $only)) {
                $data['sections'] = Section::select('section_id', 'name')->get();
            }

            if (empty($only) || in_array('classes', $only)) {
                $data['classes'] = SchoolClass::select('class_id', 'grade')->get();
            }

            if (empty($only) || in_array('school_years', $only)) {
                $data['school_years'] = SchoolYear::select('school_year_id', 'year')->get();
            }

            if (empty($only) || in_array('majors', $only)) {
                $data['majors'] = Major::select('major_id', 'name')->get();
            }

            if (empty($only) || in_array('programs', $only)) {
                $data['programs'] = Program::select('program_id', 'name')->get();
            }

            // dst sesuai kebutuhan...

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve registration options.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
