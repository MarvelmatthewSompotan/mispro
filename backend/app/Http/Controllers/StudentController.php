<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ApplicationFormVersion;

class StudentController extends Controller
{
    public function searchStudents(Request $request)
    {
        $keyword = $request->input('search');
        if (!$keyword) {
            return response()->json([]);
        }

        $students = Student::select('student_id', DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name"))
            ->where(function ($query) use ($keyword) {
                $query->where('first_name', 'like', "%$keyword%")
                    ->orWhere('middle_name', 'like', "%$keyword%")
                    ->orWhere('last_name', 'like', "%$keyword%")
                    ->orWhere(DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name)"), 'like', "%$keyword%");
            })
            ->limit(10)
            ->get();

        return response()->json($students);
    }

    public function getLatestApplication($student_id)
    {
        $latestVersion = ApplicationFormVersion::with(['applicationForm.enrollment.student',])
        ->whereHas('applicationForm.enrollment.student', function ($q) use ($student_id) {
            $q->where('student_id', $student_id);
        })
        ->orderByDesc('updated_at')
        ->first();

        if (!$latestVersion) {
            return response()->json([
                'success' => false,
                'error' => 'No application found for this student',
            ], 404);
        }

        $data = $latestVersion->data_snapshot ? json_decode($latestVersion->data_snapshot, true) : [];

        return response()->json([
            'success' => true,
            'data' => $data,
            'student' => $latestVersion->student,
        ]);
    }
}
