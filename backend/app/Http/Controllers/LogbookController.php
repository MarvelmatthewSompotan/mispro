<?php

namespace App\Http\Controllers;

use App\Models\ApplicationFormVersion;
use Log;
use Exception;
use App\Models\Student;
use App\Models\SchoolYear;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    public function index (Request $request) {
        try {
            $currentMonth = now()->month;
            $currentYear = now()->year;
            $schoolYearStr = ($currentMonth >= 7) 
                ? $currentYear . '/' . ($currentYear + 1)
                : ($currentYear - 1) . '/' . $currentYear;
            
            $schoolYear = SchoolYear::where('year', $schoolYearStr)->first();
            $defaultSchoolYearId = $schoolYear?->school_year_id;

            if (!$defaultSchoolYearId) {
                return response()->json([
                    'success' => false,
                    'error' => 'Active school year not found.',
                ], 404);
            }

            $students = Student::where('active', 'YES')
                ->with([
                    'enrollments' => function ($q) use ($defaultSchoolYearId) {
                        $q->where('school_year_id', $defaultSchoolYearId)
                            ->where('status', 'ACTIVE')
                            ->with(['schoolClass', 'section', 'schoolYear', 'transportation']);
                    },
                    'studentParent',
                    'studentAddress',
                ])
                ->get();
            
            $data = $students->map(function ($student) {
                $enrollment = $student->enrollments->first();

                $address = $student->studentAddress
                    ? trim(implode(', ', array_filter([
                        $student->studentAddress->street,
                        "{$student->studentAddress->rt}/{$student->studentAddress->rw}",
                        $student->studentAddress->village,
                        $student->studentAddress->district,
                        $student->studentAddress->city_regency,
                        $student->studentAddress->province,
                        $student->studentAddress->other,
                    ])))
                    : null;
                
                $photoPath = $student->photo_path;

                $latestVersion = ApplicationFormVersion::with('applicationForm.enrollment.student')
                    ->whereHas('applicationForm.enrollment.student', function ($q) use ($student) {
                        $q->where('student_id', $student->student_id);
                    })
                    ->orderByDesc('version_id')
                    ->first();
                
                $decoded = json_decode($latestVersion->data_snapshot);
                $photoUrl = $decoded->request_data->photo_url ?? null;
                
                return [
                    'photo' => $photoPath,
                    'photo_url' => $photoUrl,
                    'student_id' => $student->student_id,
                    'full_name' => trim("{$student->first_name} {$student->middle_name} {$student->last_name}"),
                    'grade' => $enrollment?->schoolClass?->grade,
                    'section' => $enrollment?->section?->name,
                    'school_year' => $enrollment?->schoolYear?->year,
                    'gender' => $student->gender,
                    'registration_date' => $enrollment?->registration_date,
                    'transportation' => $enrollment?->transportation?->type,
                    'nisn' => $student->nisn,
                    'family_rank' => $student->family_rank,
                    'place_dob' => "{$student->place_of_birth}, {$student->date_of_birth}",
                    'age' => $student->age,
                    'religion' => $student->religion,
                    'country' => $student->country,
                    'address' => $address,
                    'phone' => $student->phone_number,
                    'father_name' => $student->studentParent?->father_name,
                    'father_occupation' => $student->studentParent?->father_occupation,
                    'father_phone' => $student->studentParent?->father_phone,
                    'mother_name' => $student->studentParent?->mother_name,
                    'mother_occupation' => $student->studentParent?->mother_occupation,
                    'mother_phone' => $student->studentParent?->mother_phone,
                    'nik' => $student->nik,
                    'kitas' => $student->kitas,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
            ], 200);
        } catch (Exception $e) {
            Log::error('Failed to get logbook data', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
