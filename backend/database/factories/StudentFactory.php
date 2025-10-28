<?php

namespace Database\Factories;

use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StudentFactory extends Factory
{
    protected $model = Student::class;
    
    private static $counter = 0;
    private static $usedIds = [];

    public function definition(): array
    {
        $gender = fake()->randomElement(['MALE', 'FEMALE']);
        $firstName = $gender === 'MALE' ? fake()->firstNameMale() : fake()->firstNameFemale();
        $citizenship = fake()->randomElement(['Indonesia', 'Indonesia', 'Indonesia', 'Non Indonesia']);
        $isIndonesian = $citizenship === 'Indonesia';
        $country = $isIndonesian ? 'Indonesia' : $this->generateForeignCountry();
        $academicStatus = fake()->randomElement(['REGULAR', 'SIT-IN', 'OTHER']);
        $academicStatusOther = $academicStatus === 'OTHER'
            ? Str::limit(fake()->sentence(6), 50, '')
            : null;
        $studentStatuses = ['Not Graduate', 'Not Graduate', 'Not Graduate', 'Graduate', 'Expelled', 'Withdraw'];
        
        // Generate student_id following system format: {year}{section}{major}{number}
        // Format: 2411001 = 2 digit year + 1 section + 1 major + 4 digit number
        // Generate student_id following system format based on school year and section:
        // {2-digit start year}{sectionId}{majorId}{4-digit running number}
        $context = $this->resolveSchoolYearContext();
        $section = $context['section_id'];
        $major = $context['major_id'];
        $yearCode = $context['year_code'];

        $prefix = $yearCode . $section . $major;
        $studentId = $this->generateUniqueStudentId($prefix);
        
        $dateOfBirth = Carbon::instance(fake()->dateTimeBetween('-18 years', '-6 years'))->startOfDay();
        $age = $this->formatAgeString($dateOfBirth);

        return [
            'student_id' => $studentId,
            'nisn' => fake()->unique()->numerify('##########'),
            'first_name' => $firstName,
            'middle_name' => fake()->optional(0.7)->firstName(),
            'last_name' => fake()->optional(0.7)->lastName(),
            'nickname' => fake()->firstName(),
            'family_rank' => fake()->randomElement(['1', '2', '3', '4+']),
            'citizenship' => $citizenship,
            'country' => $country,
            'nik' => $isIndonesian ? $this->generateNik() : null,
            'kitas' => $isIndonesian ? null : $this->generateKitas(),
            'place_of_birth' => fake()->city(),
            'date_of_birth' => $dateOfBirth->toDateString(),
            'age' => $age,
            'gender' => $gender,
            'phone_number' => $this->generatePhoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'photo_path' => null,
            'previous_school' => fake()->company() . ' School',
            'religion' => fake()->randomElement(['Kristen', 'Islam', 'Katolik', 'Hindu', 'Buddha']),
            'active' => 'YES',
            'status' => fake()->randomElement($studentStatuses),
            'academic_status' => $academicStatus,
            'academic_status_other' => $academicStatusOther,
        ];
    }

    private function generateUniqueStudentId(string $prefix): string
    {
        do {
            $number = str_pad((self::$counter++ % 10000), 4, '0', STR_PAD_LEFT);
            $candidate = $prefix . $number;

            // Prevent collisions inside a single seeding run and against existing records
            $existsInRun = in_array($candidate, self::$usedIds, true);
            $existsInDatabase = Student::where('student_id', $candidate)->exists();
        } while ($existsInRun || $existsInDatabase);

        self::$usedIds[] = $candidate;

        return $candidate;
    }

    private function generateNik(): int
    {
        $digits = $this->generateNumericString(16);

        return (int) $digits;
    }

    private function generateKitas(): string
    {
        $length = random_int(11, 16);

        return $this->generateNumericString($length);
    }

    private function generateNumericString(int $length): string
    {
        $digits = '';

        for ($i = 0; $i < $length; $i++) {
            $digits .= (string) random_int(0, 9);
        }

        return $digits;
    }

    private function generatePhoneNumber(): string
    {
        $length = random_int(9, 11);

        return '08' . $this->generateNumericString($length);
    }

    private function formatAgeString(Carbon $dateOfBirth): string
    {
        $diff = $dateOfBirth->diff(Carbon::now());

        return sprintf('%d years, %d months', $diff->y, $diff->m);
    }

    private function generateForeignCountry(): string
    {
        do {
            $country = fake()->country();
        } while (Str::lower($country) === 'indonesia');

        return $country;
    }
    private function resolveSchoolYearContext(): array
    {
        $sectionId = fake()->numberBetween(1, 4);
        $majorId = $sectionId === 4 ? fake()->numberBetween(2, 3) : 1;

        return [
            'year_code' => '25',
            'section_id' => $sectionId,
            'major_id' => $majorId,
        ];
    }
}
