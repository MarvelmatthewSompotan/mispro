<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id('enrollment_id');
            $table->string('student_id', 30)->nullable();
            $table->unsignedBigInteger('class_id')->nullable();
            $table->unsignedBigInteger('semester_id')->nullable();
            $table->unsignedBigInteger('school_year_id')->nullable();
            $table->unsignedBigInteger('program_id')->nullable();
            $table->unsignedBigInteger('residence_id')->nullable();
            $table->unsignedBigInteger('transport_id')->nullable();
            $table->unsignedBigInteger('pickup_point_id')->nullable();
            $table->enum('residence_hall_policy', ['Signed', 'Not Signed']);
            $table->enum('transportation_policy', ['Signed', 'Not Signed']);
            $table->boolean('is_active')->default(true);
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('set null');
            $table->foreign('class_id')->references('class_id')->on('classes')->onDelete('set null');
            $table->foreign('semester_id')->references('semester_id')->on('semesters')->onDelete('set null');
            $table->foreign('school_year_id')->references('school_year_id')->on('school_years')->onDelete('set null');
            $table->foreign('program_id')->references('program_id')->on('programs')->onDelete('set null');
            $table->foreign('residence_id')->references('residence_id')->on('residence_halls')->onDelete('set null');
            $table->foreign('transport_id')->references('transport_id')->on('transportations')->onDelete('set null');
            $table->foreign('pickup_point_id')->references('pickup_point_id')->on('pickup_points')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
