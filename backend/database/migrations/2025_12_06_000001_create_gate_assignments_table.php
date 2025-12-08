<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_assignments', function (Blueprint $table) {
            $table->id('gate_assignment_id');
            $table->unsignedBigInteger('gate_point_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('assignment_type', ['security', 'gate_display']);
            $table->timestamps();

            $table->foreign('gate_point_id')
                ->references('gate_point_id')
                ->on('gate_points')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->cascadeOnDelete();

            $table->unique(['gate_point_id', 'assignment_type'], 'gate_assignments_gate_type_unique');
            $table->unique(['user_id', 'assignment_type'], 'gate_assignments_user_type_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_assignments');
    }
};
