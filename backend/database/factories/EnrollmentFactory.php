<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Section;
use App\Models\Major;
use App\Models\Semester;
use App\Models\Program;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use App\Models\PickupPoint;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    /**
     * Keep counters so generated registration numbers remain sequential per section/month.
     *
     * @var array<string, int>
     */
    protected static array $registrationCounters = [];

    public function definition(): array
    {
        $schoolYear = SchoolYear::inRandomOrder()->first() ?? SchoolYear::first();
        $section = Section::inRandomOrder()->first() ?? Section::first();
        $class = SchoolClass::inRandomOrder()->first() ?? SchoolClass::first();
        $major = Major::inRandomOrder()->first() ?? Major::first();
        $semester = Semester::inRandomOrder()->first() ?? Semester::first();
        $program = Program::inRandomOrder()->first() ?? Program::first();
        $transportation = Transportation::inRandomOrder()->first();
        $pickupPoint = PickupPoint::inRandomOrder()->first();
        $residenceHall = ResidenceHall::inRandomOrder()->first();

        $registrationDate = $this->generateRegistrationDate($schoolYear);
        $registrationId = $this->generateRegistrationId(
            $section?->section_id ?? 0,
            $registrationDate
        );

        return [
            'student_id' => Student::factory(),
            'registration_id' => $registrationId,
            'registration_date' => $registrationDate,
            'class_id' => $class?->class_id,
            'section_id' => $section?->section_id,
            'major_id' => $major?->major_id,
            'semester_id' => $semester?->semester_id,
            'school_year_id' => $schoolYear?->school_year_id,
            'program_id' => $program?->program_id,
            'transport_id' => fake()->boolean(60) ? optional($transportation)->transport_id : null,
            'pickup_point_id' => fake()->boolean(50) ? optional($pickupPoint)->pickup_point_id : null,
            'residence_id' => fake()->boolean(65) ? optional($residenceHall)->residence_id : null,
            'student_status' => fake()->randomElement(['New', 'Old', 'Transferee']),
            'residence_hall_policy' => fake()->randomElement(['Signed', 'Not Signed']),
            'transportation_policy' => fake()->randomElement(['Signed', 'Not Signed']),
            'status' => fake()->randomElement(['ACTIVE', 'ACTIVE', 'INACTIVE']),
        ];
    }

    private function generateRegistrationDate(?SchoolYear $schoolYear): Carbon
    {
        $yearLabel = $schoolYear?->year;

        if ($yearLabel && str_contains($yearLabel, '/')) {
            [$startYear, $endYear] = array_map('intval', explode('/', $yearLabel));
        } else {
            $currentYear = now()->year;
            if (now()->month >= 7) {
                $startYear = $currentYear;
                $endYear = $currentYear + 1;
            } else {
                $startYear = $currentYear - 1;
                $endYear = $currentYear;
            }
        }

        $start = Carbon::create($startYear, 7, 1)->startOfDay();
        $end = Carbon::create($endYear, 6, 30)->endOfDay();

        return Carbon::parse(fake()->dateTimeBetween($start, $end));
    }

    private function generateRegistrationId(int $sectionId, Carbon $date): string
    {
        $number = $this->nextRegistrationNumber($sectionId, $date);
        $sectionCodes = [
            1 => 'ECP',
            2 => 'ES',
            3 => 'MS',
            4 => 'HS',
        ];

        $romanMonths = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        $sectionCode = $sectionCodes[$sectionId] ?? 'XX';
        $romanMonth = $romanMonths[$date->month] ?? strtoupper($date->format('M'));
        $yearShort = substr((string) $date->year, -2);

        return "{$number}/RF.No-{$sectionCode}/{$romanMonth}-{$yearShort}";
    }

    private function nextRegistrationNumber(int $sectionId, Carbon $date): string
    {
        $key = sprintf('%d-%s', $sectionId, $date->format('Y-m'));

        if (!isset(self::$registrationCounters[$key])) {
            self::$registrationCounters[$key] = Enrollment::where('section_id', $sectionId)
                ->whereMonth('registration_date', $date->month)
                ->whereYear('registration_date', $date->year)
                ->count();
        }

        self::$registrationCounters[$key]++;

        return str_pad((string) self::$registrationCounters[$key], 3, '0', STR_PAD_LEFT);
    }
}
