<?php

namespace Database\Seeders;

use App\Models\ApplicationForm;
use App\Models\ApplicationFormVersion;
use App\Models\DiscountType;
use App\Models\Enrollment;
use App\Models\FatherAddress;
use App\Models\Guardian;
use App\Models\GuardianAddress;
use App\Models\Major;
use App\Models\MotherAddress;
use App\Models\Payment;
use App\Models\PickupPoint;
use App\Models\Program;
use App\Models\ResidenceHall;
use App\Models\SchoolClass;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\StudentAddress;
use App\Models\StudentDiscount;
use App\Models\StudentGuardian;
use App\Models\StudentParent;
use App\Models\Transportation;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    private array $registrationCounters = [];
    private array $studentIdCounters = [];
    private string $studentIdBaseYearCode = '25';

    private const SECTION_CODES = [
        1 => 'ECP',
        2 => 'ES',
        3 => 'MS',
        4 => 'HS',
    ];

    private const ROMAN_MONTHS = [
        1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
        7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
    ];

    public function run(): void
    {
        DB::disableQueryLog();

        $this->command?->info('Creating 1000 students with related data...');

        $this->ensureMasterDataExists();

        $schoolYears = SchoolYear::all()->keyBy('school_year_id');
        $sections = Section::all()->keyBy('section_id');
        $classes = SchoolClass::all()->keyBy('class_id');
        $majors = Major::all()->keyBy('major_id');
        $semesters = Semester::all()->keyBy('semester_id');
        $programs = Program::all()->keyBy('program_id');
        $transportations = Transportation::all()->keyBy('transport_id');
        $pickupPoints = PickupPoint::all()->keyBy('pickup_point_id');
        $residences = ResidenceHall::all()->keyBy('residence_id');
        $discountTypes = DiscountType::all()->keyBy('discount_type_id');

        $schoolYearIds = $schoolYears->keys()->all();
        $sectionIds = $sections->keys()->all();
        $classIds = $classes->keys()->all();
        $majorIds = $majors->keys()->all();
        $semesterIds = $semesters->keys()->all();
        $programIds = $programs->keys()->all();
        $transportIds = $transportations->keys()->all();
        $pickupIds = $pickupPoints->keys()->all();
        $residenceIds = $residences->keys()->all();
        $discountTypeIds = $discountTypes->keys()->all();

        $currentSchoolYear = $this->resolveCurrentSchoolYear($schoolYears);

        $distribution = [
            '2025/2026' => [
                'ECP' => 100,
                'Elementary School' => 100,
                'Middle School' => 100,
                'High School' => 200,
            ],
            '2026/2027' => [
                'ECP' => 100,
                'Elementary School' => 100,
                'Middle School' => 100,
                'High School' => 200,
            ],
        ];

        $sectionGradeMap = [
            'ECP' => ['N', 'K1', 'K2'],
            'Elementary School' => ['1', '2', '3', '4', '5', '6'],
            'Middle School' => ['7', '8', '9'],
            'High School' => ['10', '11', '12'],
            'default' => $classes->pluck('grade')->all(),
        ];

        $currentYearLabel = '2025/2026';
        $currentSchoolYear = $schoolYears->firstWhere('year', $currentYearLabel)
            ?? $this->resolveCurrentSchoolYear($schoolYears);

        $this->studentIdBaseYearCode = substr(explode('/', $currentSchoolYear->year)[0], -2);

        $totalCreated = 0;

        foreach ($distribution as $yearLabel => $sectionCounts) {
            $schoolYear = $schoolYears->firstWhere('year', $yearLabel);

            if (!$schoolYear) {
                throw new \RuntimeException("School year {$yearLabel} is missing. Please run MasterDataSeeder first.");
            }

            $isCurrentYear = $schoolYear->year === $currentSchoolYear->year;

            foreach ($sectionCounts as $sectionName => $targetCount) {
                $section = $sections->firstWhere('name', $sectionName);

                if (!$section) {
                    throw new \RuntimeException("Section {$sectionName} is missing. Please run MasterDataSeeder first.");
                }

                $grades = $sectionGradeMap[$sectionName] ?? $sectionGradeMap['default'];

                for ($i = 0; $i < $targetCount; $i++) {
                    $studentStatus = 'Not Graduate';

                    $grade = fake()->randomElement($grades);
                    $class = $classes->firstWhere('grade', $grade);

                    if (!$class) {
                        throw new \RuntimeException("Class with grade {$grade} is missing. Please run MasterDataSeeder first.");
                    }

                    $majorOptions = $sectionName === 'High School'
                        ? ['SCIENCE', 'SOCIAL']
                        : ['NO MAJOR'];
                    $majorName = fake()->randomElement($majorOptions);
                    $major = $majors->firstWhere('name', $majorName) ?? $majors->first();

                    if (!$major) {
                        throw new \RuntimeException('Major data is missing. Please run MasterDataSeeder first.');
                    }

                    $studentId = $this->generateStudentIdForSeeder($section->section_id, $major->major_id);

                    $student = Student::factory()
                        ->state([
                            'student_id' => $studentId,
                            'status' => $studentStatus,
                            'active' => 'YES',
                        ])
                        ->create();

                    $studentAddress = StudentAddress::factory()->create([
                        'student_id' => $student->student_id,
                    ]);

                    $parent = StudentParent::factory()->create([
                        'student_id' => $student->student_id,
                    ]);

                    $fatherAddress = FatherAddress::factory()->create([
                        'parent_id' => $parent->parent_id,
                    ]);

                    $motherAddress = MotherAddress::factory()->create([
                        'parent_id' => $parent->parent_id,
                    ]);

                    $guardian = Guardian::factory()->create();
                    $guardianAddress = GuardianAddress::factory()->create([
                        'guardian_id' => $guardian->guardian_id,
                    ]);

                    StudentGuardian::create([
                        'student_id' => $student->student_id,
                        'guardian_id' => $guardian->guardian_id,
                    ]);

                    $payment = Payment::create([
                        'student_id' => $student->student_id,
                        'tuition_fees' => fake()->randomElement(['Full Payment', 'Installment']),
                        'residence_payment' => fake()->randomElement(['Full Payment', 'Installment']),
                        'financial_policy_contract' => 'Agree',
                    ]);

                    $registrationDate = $this->randomRegistrationDate($schoolYear, $isCurrentYear);
                    $registrationNumber = $this->nextRegistrationNumber($section->section_id, $registrationDate);
                    $registrationId = $this->formatRegistrationId($registrationNumber, $section->section_id, $registrationDate);

                    $semester = $semesters->random();
                    $program = $programs->random();

                    if (!$semester || !$program) {
                        throw new \RuntimeException('Semester or Program data is missing. Please run MasterDataSeeder first.');
                    }

                    $transportation = ($transportations->isEmpty() || !fake()->boolean(60))
                        ? null
                        : $transportations->random();

                    $pickupPoint = ($transportation && !$pickupPoints->isEmpty() && fake()->boolean(70))
                        ? $pickupPoints->random()
                        : null;

                    $residenceHall = ($residences->isEmpty() || !fake()->boolean(65))
                        ? null
                        : $residences->random();

                    $enrollmentStatus = $this->resolveEnrollmentStatus($studentStatus, $isCurrentYear, 0);

                    $enrollment = new Enrollment([
                        'student_id' => $student->student_id,
                        'registration_id' => $registrationId,
                        'class_id' => $class->class_id,
                        'section_id' => $section->section_id,
                        'major_id' => $major->major_id,
                        'semester_id' => $semester->semester_id,
                        'school_year_id' => $schoolYear->school_year_id,
                        'program_id' => $program->program_id,
                        'transport_id' => $transportation?->transport_id,
                        'pickup_point_id' => $pickupPoint?->pickup_point_id,
                        'residence_id' => $residenceHall?->residence_id,
                        'student_status' => 'New',
                        'residence_hall_policy' => $residenceHall ? fake()->randomElement(['Signed', 'Not Signed']) : 'Not Signed',
                        'transportation_policy' => $transportation ? fake()->randomElement(['Signed', 'Not Signed']) : 'Not Signed',
                        'status' => $enrollmentStatus,
                    ]);
                    $enrollment->registration_date = $registrationDate;
                    $enrollment->save();

                    $discountName = null;
                    $discountNotes = null;
                    if (!empty($discountTypeIds) && fake()->boolean(25)) {
                        $discountTypeId = fake()->randomElement($discountTypeIds);
                        $discountNotes = fake()->sentence();

                        StudentDiscount::create([
                            'enrollment_id' => $enrollment->enrollment_id,
                            'discount_type_id' => $discountTypeId,
                            'notes' => $discountNotes,
                        ]);

                        $discountName = optional($discountTypes->get($discountTypeId))->name;
                    }

                    $applicationForm = new ApplicationForm([
                        'enrollment_id' => $enrollment->enrollment_id,
                        'status' => 'Confirmed',
                        'submitted_at' => $registrationDate->copy()->addDays(fake()->numberBetween(0, 10)),
                    ]);
                    $applicationForm->created_at = $registrationDate;
                    $applicationForm->save();

                    $requestData = $this->buildRequestData(
                        $student,
                        $studentAddress,
                        $parent,
                        $fatherAddress,
                        $motherAddress,
                        $guardian,
                        $guardianAddress,
                        $enrollment,
                        $schoolYear,
                        $semester,
                        $section,
                        $class,
                        $major,
                        $program,
                        $transportation,
                        $pickupPoint,
                        $residenceHall,
                        $payment,
                        $discountName,
                        $discountNotes
                    );

                    ApplicationFormVersion::create([
                        'application_id' => $applicationForm->application_id,
                        'version' => 1,
                        'updated_by' => 'seeder',
                        'action' => 'registration',
                        'data_snapshot' => json_encode([
                            'student_id' => $student->student_id,
                            'registration_id' => $enrollment->registration_id,
                            'enrollment_id' => $enrollment->enrollment_id,
                            'registration_number' => $enrollment->enrollment_id,
                            'registration_date' => $registrationDate->toDateTimeString(),
                            'application_id' => $applicationForm->application_id,
                            'semester' => optional($semester)->number,
                            'school_year' => $schoolYear->year,
                            'request_data' => $requestData,
                            'timestamp' => now()->toDateTimeString(),
                            'action' => 'registration',
                        ], JSON_PRETTY_PRINT),
                    ]);

                    $totalCreated++;

                    if ($totalCreated % 100 === 0) {
                        $this->command?->info('Created ' . $totalCreated . ' students...');
                    }
                }
            }
        }

        $this->command?->info('Successfully created ' . $totalCreated . ' students with related data!');
    }

    private function ensureMasterDataExists(): void
    {
        $checks = [
            'Program' => Program::class,
            'Section' => Section::class,
            'School year' => SchoolYear::class,
            'Semester' => Semester::class,
            'Class' => SchoolClass::class,
            'Major' => Major::class,
        ];

        foreach ($checks as $label => $model) {
            if ($model::count() === 0) {
                throw new \RuntimeException("{$label} data is empty. Please run MasterDataSeeder first.");
            }
        }
    }

    private function resolveCurrentSchoolYear($schoolYears): SchoolYear
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $label = $currentMonth >= 7
            ? sprintf('%d/%d', $currentYear, $currentYear + 1)
            : sprintf('%d/%d', $currentYear - 1, $currentYear);

        $schoolYear = $schoolYears->firstWhere('year', $label)
            ?? $schoolYears->first();

        if (!$schoolYear) {
            throw new \RuntimeException('School year data is empty. Please run MasterDataSeeder first.');
        }

        return $schoolYear;
    }

    private function randomRegistrationDate(SchoolYear $schoolYear, bool $isCurrentYear): Carbon
    {
        $parts = explode('/', $schoolYear->year);

        if (count($parts) === 2) {
            [$startYear, $endYear] = array_map('intval', $parts);
        } else {
            $startYear = (int) $schoolYear->year;
            $endYear = $startYear + 1;
        }

        if ($isCurrentYear) {
            $start = Carbon::create($startYear, 7, 1)->startOfDay();
            $end = Carbon::create($endYear, 6, 30)->endOfDay();
        } else {
            $currentYear = now()->year;
            $start = Carbon::create($currentYear, 1, 1)->startOfYear();
            $end = now()->copy()->endOfDay();
        }

        return Carbon::parse(fake()->dateTimeBetween($start, $end));
    }

    private function nextRegistrationNumber(int $sectionId, Carbon $date): string
    {
        $key = sprintf('%d-%s', $sectionId, $date->format('Y-m'));

        if (!isset($this->registrationCounters[$key])) {
            $this->registrationCounters[$key] = Enrollment::where('section_id', $sectionId)
                ->whereMonth('registration_date', $date->month)
                ->whereYear('registration_date', $date->year)
                ->count();
        }

        $this->registrationCounters[$key]++;

        return str_pad((string) $this->registrationCounters[$key], 3, '0', STR_PAD_LEFT);
    }

    private function formatRegistrationId(string $number, int $sectionId, Carbon $date): string
    {
        $sectionCode = self::SECTION_CODES[$sectionId] ?? 'XX';
        $romanMonth = self::ROMAN_MONTHS[$date->month] ?? strtoupper($date->format('M'));
        $yearShort = substr((string) $date->year, -2);

        return "{$number}/RF.No-{$sectionCode}/{$romanMonth}-{$yearShort}";
    }

    private function generateStudentIdForSeeder(int $sectionId, int $majorId): string
    {
        $yearCode = $this->studentIdBaseYearCode ?? '25';
        $prefix = $yearCode . $sectionId . $majorId;

        if (!isset($this->studentIdCounters[$prefix])) {
            $latest = Student::where('student_id', 'LIKE', $prefix . '%')
                ->orderByDesc('student_id')
                ->value('student_id');

            $this->studentIdCounters[$prefix] = $latest
                ? (int) substr($latest, -4)
                : 0;
        }

        $this->studentIdCounters[$prefix]++;

        $number = str_pad((string) $this->studentIdCounters[$prefix], 4, '0', STR_PAD_LEFT);

        return $prefix . $number;
    }

    private function resolveEnrollmentStatus(string $studentStatus, bool $isCurrentYear, int $enrollmentIndex): string
    {
        if (!$isCurrentYear || $studentStatus !== 'Not Graduate') {
            return 'INACTIVE';
        }

        return $enrollmentIndex === 0 ? 'ACTIVE' : fake()->randomElement(['ACTIVE', 'INACTIVE']);
    }

    private function buildRequestData(
        Student $student,
        StudentAddress $studentAddress,
        StudentParent $parent,
        FatherAddress $fatherAddress,
        MotherAddress $motherAddress,
        ?Guardian $guardian,
        ?GuardianAddress $guardianAddress,
        Enrollment $enrollment,
        SchoolYear $schoolYear,
        ?Semester $semester,
        ?Section $section,
        ?SchoolClass $class,
        ?Major $major,
        ?Program $program,
        ?Transportation $transportation,
        ?PickupPoint $pickupPoint,
        ?ResidenceHall $residenceHall,
        Payment $payment,
        ?string $discountName,
        ?string $discountNotes
    ): array {
        return [
            'student_id' => $student->student_id,
            'student_status' => $enrollment->student_status,
            'first_name' => $student->first_name,
            'middle_name' => $student->middle_name,
            'last_name' => $student->last_name,
            'nickname' => $student->nickname,
            'citizenship' => $student->citizenship,
            'country' => $student->country,
            'religion' => $student->religion,
            'place_of_birth' => $student->place_of_birth,
            'date_of_birth' => $student->date_of_birth,
            'email' => $student->email,
            'phone_number' => $student->phone_number,
            'previous_school' => $student->previous_school,
            'academic_status' => $student->academic_status,
            'academic_status_other' => $student->academic_status_other,
            'gender' => $student->gender,
            'family_rank' => $student->family_rank,
            'age' => $student->age,
            'nisn' => $student->nisn,
            'nik' => $student->nik,
            'kitas' => $student->kitas,
            'street' => $studentAddress->street,
            'rt' => $studentAddress->rt,
            'rw' => $studentAddress->rw,
            'village' => $studentAddress->village,
            'district' => $studentAddress->district,
            'city_regency' => $studentAddress->city_regency,
            'province' => $studentAddress->province,
            'other' => $studentAddress->other,
            'section_id' => $enrollment->section_id,
            'section_name' => optional($section)->name,
            'program_id' => $enrollment->program_id,
            'program_name' => optional($program)->name,
            'class_id' => $enrollment->class_id,
            'class_grade' => optional($class)->grade,
            'major_id' => $enrollment->major_id,
            'major_name' => optional($major)->name,
            'school_year_id' => $enrollment->school_year_id,
            'school_year' => $schoolYear->year,
            'semester_id' => $enrollment->semester_id,
            'semester' => optional($semester)->name,
            'transportation_id' => $enrollment->transport_id,
            'transportation_name' => optional($transportation)->type,
            'transportation_policy' => $enrollment->transportation_policy,
            'pickup_point_id' => $enrollment->pickup_point_id,
            'pickup_point_name' => optional($pickupPoint)->name,
            'pickup_point_custom' => null,
            'residence_id' => $enrollment->residence_id,
            'residence_name' => optional($residenceHall)->type,
            'residence_hall_policy' => $enrollment->residence_hall_policy,
            'tuition_fees' => $payment->tuition_fees,
            'residence_payment' => $payment->residence_payment,
            'financial_policy_contract' => $payment->financial_policy_contract,
            'discount_name' => $discountName,
            'discount_notes' => $discountNotes,
            'father_name' => $parent->father_name,
            'father_company' => $parent->father_company,
            'father_occupation' => $parent->father_occupation,
            'father_phone' => $parent->father_phone,
            'father_email' => $parent->father_email,
            'father_address_street' => $fatherAddress->street,
            'father_address_rt' => $fatherAddress->rt,
            'father_address_rw' => $fatherAddress->rw,
            'father_address_village' => $fatherAddress->village,
            'father_address_district' => $fatherAddress->district,
            'father_address_city_regency' => $fatherAddress->city_regency,
            'father_address_province' => $fatherAddress->province,
            'father_address_other' => $fatherAddress->other,
            'father_company_addresses' => null,
            'mother_name' => $parent->mother_name,
            'mother_company' => $parent->mother_company,
            'mother_occupation' => $parent->mother_occupation,
            'mother_phone' => $parent->mother_phone,
            'mother_email' => $parent->mother_email,
            'mother_address_street' => $motherAddress->street,
            'mother_address_rt' => $motherAddress->rt,
            'mother_address_rw' => $motherAddress->rw,
            'mother_address_village' => $motherAddress->village,
            'mother_address_district' => $motherAddress->district,
            'mother_address_city_regency' => $motherAddress->city_regency,
            'mother_address_province' => $motherAddress->province,
            'mother_address_other' => $motherAddress->other,
            'mother_company_addresses' => null,
            'guardian_name' => optional($guardian)->guardian_name,
            'relation_to_student' => optional($guardian)->relation_to_student,
            'guardian_phone' => optional($guardian)->phone_number,
            'guardian_email' => optional($guardian)->guardian_email,
            'guardian_address_street' => optional($guardianAddress)->street,
            'guardian_address_rt' => optional($guardianAddress)->rt,
            'guardian_address_rw' => optional($guardianAddress)->rw,
            'guardian_address_village' => optional($guardianAddress)->village,
            'guardian_address_district' => optional($guardianAddress)->district,
            'guardian_address_city_regency' => optional($guardianAddress)->city_regency,
            'guardian_address_province' => optional($guardianAddress)->province,
            'guardian_address_other' => optional($guardianAddress)->other,
            'student_active' => $student->active,
            'status' => $student->status,
            'enrollment_status' => $enrollment->status,
            'application_form_status' => 'Confirmed',
            'photo_path' => $student->photo_path,
            'photo_url' => null,
        ];
    }
}
