<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
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
    }
}
