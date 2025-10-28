<?php

namespace Database\Factories;

use App\Models\ApplicationForm;
use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFormFactory extends Factory
{
    protected $model = ApplicationForm::class;

    public function definition(): array
    {
        $submittedAt = Carbon::parse(fake()->dateTimeBetween('-1 year', 'now'));

        return [
            'enrollment_id' => Enrollment::factory(),
            'status' => 'Confirmed',
            'submitted_at' => $submittedAt,
            'created_at' => $submittedAt,
        ];
    }
}
