<?php

namespace App\Http\Controllers;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\Transportation;
use App\Models\ResidenceHall;
use App\Models\PickupPoint;
use App\Models\DiscountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TestController extends Controller
{
    /**
     * Test endpoint untuk menambah data master
     */
    public function addMasterData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:program,section,major,transportation,residence,pickup,discount',
            'data' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $type = $request->type;
            $data = $request->data;
            $result = [];

            switch ($type) {
                case 'program':
                    foreach ($data as $item) {
                        $result[] = Program::create(['name' => $item['name']]);
                    }
                    break;

                case 'section':
                    foreach ($data as $item) {
                        $result[] = Section::create(['name' => $item['name']]);
                    }
                    break;

                case 'major':
                    foreach ($data as $item) {
                        $result[] = Major::create(['name' => $item['name']]);
                    }
                    break;

                case 'transportation':
                    foreach ($data as $item) {
                        $result[] = Transportation::create(['type' => $item['type']]);
                    }
                    break;

                case 'residence':
                    foreach ($data as $item) {
                        $result[] = ResidenceHall::create(['type' => $item['type']]);
                    }
                    break;

                case 'pickup':
                    foreach ($data as $item) {
                        $result[] = PickupPoint::create(['name' => $item['name']]);
                    }
                    break;

                case 'discount':
                    foreach ($data as $item) {
                        $result[] = DiscountType::create(['name' => $item['name']]);
                    }
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' data added successfully',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add ' . $type . ' data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk menambah school year dan semester
     */
    public function addAcademicData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_years' => 'nullable|array',
            'semesters' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = [];

            // Add school years
            if ($request->has('school_years')) {
                foreach ($request->school_years as $year) {
                    $result['school_years'][] = SchoolYear::create(['year' => $year]);
                }
            }

            // Add semesters
            if ($request->has('semesters')) {
                foreach ($request->semesters as $semester) {
                    $result['semesters'][] = Semester::create([
                        'name' => $semester['name'],
                        'number' => $semester['number']
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Academic data added successfully',
                'data' => $result
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add academic data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk menambah school class
     */
    public function addSchoolClass(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grade' => 'required|string',
            'section_id' => 'required|exists:sections,section_id',
            'major_id' => 'required|exists:majors,major_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $schoolClass = SchoolClass::firstOrCreate([
                'grade' => $request->grade,
                'section_id' => $request->section_id,
                'major_id' => $request->major_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'School class added successfully',
                'data' => $schoolClass->load(['section', 'major'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add school class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk melihat semua data master
     */
    public function getAllMasterData()
    {
        try {
            $data = [
                'programs' => Program::all(),
                'sections' => Section::all(),
                'majors' => Major::all(),
                'transportations' => Transportation::all(),
                'residence_halls' => ResidenceHall::all(),
                'pickup_points' => PickupPoint::all(),
                'discount_types' => DiscountType::all(),
                'school_years' => SchoolYear::all(),
                'semesters' => Semester::all(),
                'school_classes' => SchoolClass::with(['section', 'major'])->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get master data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk melihat data student
     */
    public function getStudents()
    {
        try {
            $students = Student::with([
                'studentAddress',
                'studentParent.fatherAddress',
                'studentParent.motherAddress',
                'studentGuardian.guardian.guardianAddress',
                'enrollments.schoolClass.section',
                'enrollments.schoolClass.major',
                'enrollments.program',
                'enrollments.transportation',
                'enrollments.residenceHall',
                'enrollments.studentDiscount.discountType'
            ])->get();

            return response()->json([
                'success' => true,
                'count' => $students->count(),
                'data' => $students
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get students: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk menghapus data (cleanup)
     */
    public function cleanupData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tables' => 'required|array',
            'tables.*' => 'in:students,enrollments,application_forms,application_form_versions,payments,student_discounts,student_addresses,student_parents,father_addresses,mother_addresses,student_guardians,guardians,guardian_addresses,pickup_points,transportations,residence_halls,classes,school_years,semesters,programs,sections,majors,discount_types'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->tables as $table) {
                DB::table($table)->truncate();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data cleaned up successfully',
                'cleaned_tables' => $request->tables
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to cleanup data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint untuk health check
     */
    public function healthCheck()
    {
        try {
            $dbStatus = DB::connection()->getPdo() ? 'connected' : 'disconnected';
            
            return response()->json([
                'success' => true,
                'status' => 'healthy',
                'database' => $dbStatus,
                'timestamp' => now()->toISOString()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }
} 