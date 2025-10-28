<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentAddressFactory extends Factory
{
    protected $model = StudentAddress::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'street' => fake()->streetAddress(),
            'village' => fake()->citySuffix(),
            'district' => fake()->city(),
            'rt' => (string) fake()->numberBetween(1, 20),
            'rw' => (string) fake()->numberBetween(1, 10),
            'city_regency' => fake()->city(),
            'province' => fake()->state(),
            'other' => fake()->optional()->address(),
        ];
    }
}

