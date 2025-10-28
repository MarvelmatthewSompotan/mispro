<?php

namespace Database\Factories;

use App\Models\Guardian;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuardianFactory extends Factory
{
    protected $model = Guardian::class;

    public function definition(): array
    {
        return [
            'guardian_name' => fake()->name(),
            'relation_to_student' => fake()->randomElement(['Kakek', 'Nenek', 'Paman', 'Bibi', 'Sepupu', 'Lainnya']),
            'phone_number' => $this->generatePhoneNumber(),
            'guardian_email' => fake()->safeEmail(),
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
