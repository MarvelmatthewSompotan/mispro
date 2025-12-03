<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_points', function (Blueprint $table) {
            $table->id('gate_point_id');
            $table->string('name', 100);
            $table->enum('type', ['Main', 'Bus', 'Dorm']);
            $table->enum('direction', ['Entry', 'Exit', 'Both'])->default('Both');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_points');
    }
};

