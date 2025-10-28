<?php

namespace Database\Factories;

use App\Models\MotherAddress;
use App\Models\StudentParent;
use Illuminate\Database\Eloquent\Factories\Factory;

class MotherAddressFactory extends Factory
{
    protected $model = MotherAddress::class;

    public function definition(): array
    {
        return [
            'parent_id' => StudentParent::factory(),
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

