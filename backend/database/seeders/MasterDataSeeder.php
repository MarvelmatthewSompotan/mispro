<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use App\Models\SchoolYear;
use App\Models\SchoolClass;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // program
        foreach(['UAN', 'A Beka', 'Cambrige', 'Oxford'] as $program) {
            Program::create(['name' => $program]);
        }

        // section
        foreach(['ECP', 'Elementary School', 'Middle School', 'High School'] as $section) {
            Section::create(['name' => $section]);
        }

        // major
        foreach(['NO MAJOR', 'SOCIAL', 'SCIENCE'] as $major) {
            Major::create(['name' => $major]);
        }

        // transportation
        foreach(['Own car', 'School bus'] as $type) {
            Transportation::create(['type' => $type]);
        }

        // residence
        foreach(['Boys dormitory', 'Girls dormitory', 'Non-Residence hall'] as $type) {
            ResidenceHall::create(['type' => $type]);
        }

        // semester
        $semesters = [
            ['name' => 'One', 'number' => '1'],
            ['name' => 'Two', 'number' => '2'],
        ];

        foreach ($semesters as $data) {
            Semester::create($data);
        }

        // school year
        $years = ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'];
        foreach($years as $year) {
            SchoolYear::create(['year' => $year]);
        }

        $grades = ['N', 'K1', 'K2', '1','2','3','4','5','6','7','8','9','10','11','12'];
        foreach ($grades as $grade) {
            // Konversi angka string jadi integer (jika bisa)
            $gradeInt = is_numeric($grade) ? (int)$grade : null;

            if (in_array($grade, ['N', 'K1', 'K2'])) {
                // TK (Section ID: 1, Major ID: 1)
                SchoolClass::firstOrCreate([
                    'grade' => $grade,
                    'section_id' => 1,
                    'major_id' => 1,
                ]);
            } elseif ($gradeInt >= 1 && $gradeInt <= 6) {
                // SD (Section ID: 2, Major ID: 1)
                SchoolClass::firstOrCreate([
                    'grade' => $grade,
                    'section_id' => 2,
                    'major_id' => 1,
                ]);
            } elseif ($gradeInt >= 7 && $gradeInt <= 8) {
                // Middle School (7–8) (Section ID: 3, Major ID: 1)
                SchoolClass::firstOrCreate([
                    'grade' => $grade,
                    'section_id' => 3,
                    'major_id' => 1,
                ]);
            } elseif ($gradeInt === 9) {
                // Grade 9 (Section ID: 3, Major ID: 2 & 3)
                foreach ([2, 3] as $majorId) {
                    SchoolClass::firstOrCreate([
                        'grade' => $grade,
                        'section_id' => 3,
                        'major_id' => $majorId,
                    ]);
                }
            } elseif ($gradeInt >= 10 && $gradeInt <= 12) {
                // High School (Section ID: 4, Major ID: 2 & 3)
                foreach ([2, 3] as $majorId) {
                    SchoolClass::firstOrCreate([
                        'grade' => $grade,
                        'section_id' => 4,
                        'major_id' => $majorId,
                    ]);
                }
            }
        }
    }


}

