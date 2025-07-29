<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\Semester;
use App\Models\SchoolYear;
use App\Models\PickupPoint;
use App\Models\SchoolClass;
use App\Models\DiscountType;
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

        $discountTypes = [
            'Beasiswa',
            'Special Diskon',
            'Staff',
            'Weiver',
            'IP'
        ];
        foreach ($discountTypes as $discount) {
            DiscountType::firstOrCreate(['name' => $discount]);
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

        // pickup point
        $pickupPoints = [
            'Bitung 1: Bus #10 - Pusat Kota',
            'Bitung 2: Bus #11 - Pelabuhan',
            'Bitung 3: Bus #12 - Wangurer',
            'Bitung 4: Bus #13 - Girian',
            'Bitung 5: Bus #23 - Girian',
            'Bitung 6: Bus #14 - Pusat Kota',
            'Kema/Minawerot: Bus #15 - Kema 3',
            'Airmadidi/Agape/Unklab',
            'Tatelu: Bus #37 Pertigaan Pinily Tatelu',
            'Maumbi: Walanda Maramis - Maumbi',
            'Pemda/Kawangkoan/Asabri/Rizky',
            'Sunflower/Perkamil: SF Paal Dua - Martadinata',
            'MGP/Lapangan: MGP 1 - Bus #27 - Tamansari',
            'MGP/Lapangan: MGP 2 - Bus #28 - Adipura',
            'MGP/Lapangan: MGP 3 - Bus #26 - Lippo Plaza',
            'Tuminting/Kombos: Bus #25 & #38 - Gereja Torsina',
            'Bank Mandiri Sudirman (Manado): Bus #19 & #20',
            'Winangun/Teling/Karombasan: RS Advent Teling',
            'Citraland/Kantor Pemasaran Citraland',
            'Bank Niaga 1: Bus #21 - Starphoto',
            'Bank Niaga 2: Bus #22 - Starphoto',
            'Malalayang 1: Bus #30 - Lapangan Bantik',
            'Malalayang 2: Bus #31 - Lapangan Bantik',
            'Malalayang 3: Bus #32 - Lapangan Bantik',
        ];

        foreach($pickupPoints as $name) {
            PickupPoint::create(['name' => $name]);
        }
        
        // grade
        $grades = ['N', 'K1', 'K2', '1','2','3','4','5','6','7','8','9','10','11','12'];
        foreach ($grades as $grade) {
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

