<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use App\Models\SchoolYear;
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
        $years = [
            ['start_year' => '2024', 'end_year' => '2025'],
            ['start_year' => '2025', 'end_year' => '2026'],
        ];
        foreach($years as $year) {
            SchoolYear::create($year);
        }
    }
}
