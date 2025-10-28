<?php

namespace Database\Factories;

use App\Models\Guardian;
use App\Models\GuardianAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuardianAddressFactory extends Factory
{
    protected $model = GuardianAddress::class;

    public function definition(): array
    {
        return [
            'guardian_id' => Guardian::factory(),
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

