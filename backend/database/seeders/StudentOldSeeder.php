<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentOldSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = storage_path('STUDENTOLD_FIKS.csv');

        if (!file_exists($csvPath)) {
            $this->command->error("CSV file not found at: {$csvPath}");
            return;
        }

        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            $this->command->error("Failed to open CSV file.");
            return;
        }

        // CSV column order (0-indexed):
        // 0: row_index (skip)
        // 1: studentold_id
        // 2: nisn
        // 3: first_name
        // 4: middle_name
        // 5: last_name
        // 6: nickname
        // 7: place_of_birth
        // 8: date_of_birth
        // 9: gender
        // 10: student_address
        // 11: student_phone
        // 12: student_email
        // 13: previous_school
        // 14: religion
        // 15: nik
        // 16: section
        // 17: section_id
        // 18: class
        // 19: class_id
        // 20: father_name
        // 21: father_occupation
        // 22: father_company
        // 23: father_address
        // 24: father_phone
        // 25: father_email
        // 26: mother_name
        // 27: mother_occupation
        // 28: mother_company
        // 29: mother_address
        // 30: mother_phone
        // 31: mother_email
        // 32: guardian_name
        // 33: relation_to_student
        // 34: guardian_address
        // 35: guardian_phone

        $batch = [];
        $chunkSize = 500;
        $total = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 2) {
                continue;
            }

            $str = fn($i) => isset($row[$i]) && $row[$i] !== '' ? trim($row[$i]) : null;
            $int = fn($i) => isset($row[$i]) && $row[$i] !== '' ? (int) $row[$i] : null;

            $batch[] = [
                'studentold_id'      => $int(1),
                'nisn'               => $str(2),
                'first_name'         => $str(3),
                'middle_name'        => $str(4),
                'last_name'          => $str(5),
                'nickname'           => $str(6),
                'place_of_birth'     => $str(7),
                'date_of_birth'      => $str(8),
                'gender'             => $str(9),
                'student_address'    => $str(10),
                'student_phone'      => $str(11),
                'student_email'      => $str(12),
                'previous_school'    => $str(13),
                'religion'           => $str(14),
                'nik'                => $int(15),
                'section'            => $str(16),
                'section_id'         => $int(17),
                'class'              => $str(18),
                'class_id'           => $int(19),
                'father_name'        => $str(20),
                'father_occupation'  => $str(21),
                'father_company'     => $str(22),
                'father_address'     => $str(23),
                'father_phone'       => $str(24),
                'father_email'       => $str(25),
                'mother_name'        => $str(26),
                'mother_occupation'  => $str(27),
                'mother_company'     => $str(28),
                'mother_address'     => $str(29),
                'mother_phone'       => $str(30),
                'mother_email'       => $str(31),
                'guardian_name'      => $str(32),
                'relation_to_student'=> $str(33),
                'guardian_address'   => $str(34),
                'guardian_phone'     => $str(35),
            ];

            if (count($batch) >= $chunkSize) {
                DB::table('student_old_table')->insertOrIgnore($batch);
                $total += count($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('student_old_table')->insertOrIgnore($batch);
            $total += count($batch);
        }

        fclose($handle);

        $this->command->info("Seeded {$total} records into student_old_table.");
    }
}
