<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
    {
        Schema::create('student_old_table', function (Blueprint $table) {
            $table->integer('studentold_id')->primary();
            $table->string('nisn', 10)->nullable();
            $table->string('first_name', 50)->nullable();
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50)->nullable();
            $table->string('nickname', 50)->nullable();
            $table->string('place_of_birth', 100)->nullable();
            $table->date('date_of_birth', 100)->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('student_address', 100)->nullable();
            $table->string('student_phone', 20)->nullable();
            $table->string('student_email', 100)->nullable();
            $table->string('previous_school', 100)->nullable();
            $table->string('religion', 30)->nullable();
            $table->string('nik', 16)->nullable();
            $table->string('section', 10)->nullable();
            $table->string('grade', 10)->nullable();
            $table->string('father_name', 100)->nullable();
            $table->string('father_occupation', 100)->nullable();
            $table->string('father_company', 100)->nullable();
            $table->string('father_address', 100)->nullable();
            $table->string('father_phone', 20)->nullable();
            $table->string('father_email', 100)->nullable();
            $table->string('mother_name', 100)->nullable();
            $table->string('mother_occupation', 100)->nullable();
            $table->string('mother_company', 100)->nullable();
            $table->string('mother_address', 100)->nullable();
            $table->string('mother_phone', 20)->nullable();
            $table->string('mother_email', 100)->nullable();
            $table->string('guardian_name', 100)->nullable();
            $table->string('relation_to_student', 100)->nullable();
            $table->string('guardian_address', 100)->nullable();
            $table->string('guardian_phone', 20)->nullable();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('student_old_table');
    }
};