<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentParentFactory extends Factory
{
    protected $model = StudentParent::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'father_name' => fake()->name('male'),
            'father_occupation' => fake()->jobTitle(),
            'father_company' => fake()->company(),
            'father_phone' => $this->generatePhoneNumber(),
            'father_email' => fake()->safeEmail(),
            'mother_name' => fake()->name('female'),
            'mother_occupation' => fake()->jobTitle(),
            'mother_company' => fake()->company(),
            'mother_phone' => $this->generatePhoneNumber(),
            'mother_email' => fake()->safeEmail(),
        ];
    }

    private function generatePhoneNumber(): string
    {
        $length = random_int(9, 11);

        $digits = '';
        for ($i = 0; $i < $length; $i++) {
            $digits .= (string) random_int(0, 9);
        }

        return '08' . $digits;
    }
}
