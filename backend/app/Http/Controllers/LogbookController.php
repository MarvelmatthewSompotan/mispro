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

            $targetSchoolYearIds = [];

            if ($schoolYearsRequest = $request->input('school_years')) {
                $targetSchoolYearIds = SchoolYear::whereIn('year', (array)$schoolYearsRequest)
                                                ->pluck('school_year_id')
                                                ->toArray();
            } else {
                $targetSchoolYearIds[] = $defaultSchoolYearId;
            }
            $studentsQuery = Student::where('active', 'YES')
                ->with([
                    'enrollments' => function ($q) use ($targetSchoolYearIds) {
                        $q->whereIn('school_year_id', $targetSchoolYearIds);
                        $q->orderBy('semester_id', 'desc'); 
                        $q->with(['schoolClass', 'section', 'schoolYear', 'transportation']);
                    },
                    'studentParent',
                    'studentAddress',
                ]);
            
            $studentsQuery->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                $q->whereIn('school_year_id', $targetSchoolYearIds);
            });

            // Filter (search)
            if ($name = $request->input('search_name')) {
                $studentsQuery->where(function ($q) use ($name) {
                    $q->whereRaw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name) LIKE ?", ["%{$name}%"]);
                })
                ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                    $q->whereIn('school_year_id', $targetSchoolYearIds);
                });
            }

            if ($family = $request->input('search_family_rank')) {
                $studentsQuery->where('family_rank', 'like', "%$family%")
                    ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                        $q->whereIn('school_year_id', $targetSchoolYearIds);
                });     
            }

            if ($religion = $request->input('search_religion')) {
                $studentsQuery->where('religion', 'like', "%$religion%")
                    ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                        $q->whereIn('school_year_id', $targetSchoolYearIds);
                });     
            }
            
            if ($country = $request->input('search_country')) {
                $studentsQuery->where('country', 'like', "%$country%")
                    ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                        $q->whereIn('school_year_id', $targetSchoolYearIds);
                });     
            }

            if ($father = $request->input('search_father')) {
                $studentsQuery->whereHas('studentParent', function ($q) use ($father) {
                    $q->where('father_name', 'like', "%$father%");
                })
                ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                    $q->whereIn('school_year_id', $targetSchoolYearIds);
                });     
            }

            if ($mother = $request->input('search_mother')) {
                $studentsQuery->whereHas('studentParent', function ($q) use ($mother) {
                    $q->where('mother_name', 'like', "%$mother%");
                })
                ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                    $q->whereIn('school_year_id', $targetSchoolYearIds);
                });     
            }

            $filterSchoolYearIds = [];
            $schoolYearsRequest = $request->input('school_years');
            if ($schoolYearsRequest) {
                $filterSchoolYearIds = SchoolYear::whereIn('year', (array)$schoolYearsRequest)
                                                ->pluck('school_year_id')
                                                ->toArray();
            } else {
                $filterSchoolYearIds[] = $defaultSchoolYearId;
            }

            // Fiter (checkbox)
            if ($grades = $request->input('grades')) {
                $studentsQuery->whereHas('enrollments', function ($q) use ($grades, $filterSchoolYearIds) {
                    $q->whereHas('schoolClass', function ($c) use ($grades) {
                        $c->whereIn('grade', (array)$grades);
                    });
                    
                    $q->whereIn('school_year_id', $filterSchoolYearIds);
                });
            }

            if ($sections = $request->input('sections')) {
                $studentsQuery->whereHas('enrollments', function ($q) use ($sections, $filterSchoolYearIds) {
                    $q->whereHas('section', function ($c) use ($sections) {
                        $c->whereIn('name', (array)$sections);
                    });

                    $q->whereIn('school_year_id', $filterSchoolYearIds);
                });
            }

            if ($schoolYears = $request->input('school_years')) {
                $studentsQuery->whereHas('enrollments.schoolYear', function ($q) use ($schoolYears) {
                    $q->whereIn('year', (array)$schoolYears);
                });
            }

            if ($genders = $request->input('genders')) {
                $studentsQuery->whereIn('gender', (array)$genders) 
                    ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                        $q->whereIn('school_year_id', $targetSchoolYearIds);
                    });
            }
            
            if ($transportations = $request->input('transportations')) {
                $studentsQuery->whereHas('enrollments', function ($q) use ($transportations, $filterSchoolYearIds) {
                    $q->whereHas('transportation', function ($t) use ($transportations) {
                        $t->whereIn('type', (array)$transportations);
                    });
                    
                    $q->whereIn('school_year_id', $filterSchoolYearIds);
                });
            }

            // Filter (range)
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $studentsQuery->whereHas('enrollments', function ($q) use ($request, $targetSchoolYearIds) {
                    $q->whereBetween('registration_date', [
                        $request->input('start_date'), 
                        $request->input('end_date')
                    ]);
                    $q->whereIn('school_year_id', $targetSchoolYearIds);
                });
            }

            if ($request->filled('min_age') && $request->filled('max_age')) {
                $studentsQuery->whereBetween('age', [
                    $request->input('min_age'), 
                    $request->input('max_age')
                ])
                ->whereHas('enrollments', function ($q) use ($targetSchoolYearIds) {
                    $q->whereIn('school_year_id', $targetSchoolYearIds);
                });
            }

            // Sort
            $sortable = [
                'student_id',
                'full_name',
                'grade',
                'section',
                'school_year',
                'gender',
                'registration_date',
                'transportation',
                'family_rank',
                'age',
                'religion',
                'country',
                'father_name',
                'father_occupation',
                'mother_name',
                'mother_occupation',
            ];

            $sorts = $request->input('sort', []);

            $joinMap = [
                'enrollments' => false,
                'classes' => false,
                'sections' => false,
                'school_years' => false,
                'transportations' => false,
                'parents' => false,
            ];

            foreach ($sorts as $sort) {
                $field = $sort['field'] ?? null;
                $order = $sort['order'] ?? 'asc';

                if (!$field || !in_array($field, $sortable)) continue;

                switch ($field) {
                    case 'full_name':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        $studentsQuery->orderByRaw("CONCAT(students.first_name, ' ', COALESCE(students.middle_name, ''), ' ', students.last_name) $order");
                        break;

                    case 'grade':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        if (!$joinMap['classes']) {
                            $studentsQuery->leftJoin('classes', 'enrollments.class_id', '=', 'classes.class_id');
                            $joinMap['classes'] = true;
                        }
                        $studentsQuery->orderBy('classes.grade', $order);
                        break;

                    case 'section':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        if (!$joinMap['sections']) {
                            $studentsQuery->leftJoin('sections', 'enrollments.section_id', '=', 'sections.section_id');
                            $joinMap['sections'] = true;
                        }
                        $studentsQuery->orderBy('sections.name', $order);
                        break;

                    case 'school_year':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        if (!$joinMap['school_years']) {
                            $studentsQuery->leftJoin('school_years', 'enrollments.school_year_id', '=', 'school_years.school_year_id');
                            $joinMap['school_years'] = true;
                        }
                        $studentsQuery->orderBy('school_years.year', $order);
                        break;

                    case 'registration_date':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        $studentsQuery->orderBy('enrollments.registration_date', $order);
                        break;

                    case 'transportation':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        if (!$joinMap['transportations']) {
                            $studentsQuery->leftJoin('transportations', 'enrollments.transport_id', '=', 'transportations.transport_id');
                            $joinMap['transportations'] = true;
                        }
                        $studentsQuery->orderBy('transportations.type', $order);
                        break;

                    case 'father_name':
                    case 'father_occupation':
                    case 'mother_name':
                    case 'mother_occupation':
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        if (!$joinMap['parents']) {
                            $studentsQuery->leftJoin('parents', 'students.student_id', '=', 'parents.student_id');
                            $joinMap['parents'] = true;
                        }
                        $studentsQuery->orderBy("parents.$field", $order);
                        break;

                    default:
                        if (!$joinMap['enrollments']) {
                            $studentsQuery->leftJoin('enrollments', function($join) use ($targetSchoolYearIds) {
                                $join->on('students.student_id', '=', 'enrollments.student_id')
                                    ->whereIn('enrollments.school_year_id', $targetSchoolYearIds);
                            });
                            $joinMap['enrollments'] = true;
                        }
                        $studentsQuery->orderBy("students.$field", $order);
                        break;
                }
            }

            $studentsQuery->distinct('students.student_id')->select('students.*');
            // pagination
            $perPage = $request->input('per_page', 25);
            $students = $studentsQuery->paginate($perPage);


            $data = $students->getCollection()->map(function ($student) {
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

            $students->setCollection($data);

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'current_page' => $students->currentPage(),
                    'per_page' => $students->perPage(),
                    'total' => $students->total(),
                    'last_page' => $students->lastPage(),
                ],
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
