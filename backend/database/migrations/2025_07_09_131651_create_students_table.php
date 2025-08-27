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
        Schema::create('students', function (Blueprint $table) {
            $table->string('student_id', 30)->primary();
            $table->string('nisn', 10);
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50)->default('-');
            $table->string('nickname', 20)->nullable();
            $table->string('family_rank', 10);
            $table->enum('citizenship', ['Indonesia', 'Non Indonesia']);
            $table->string('country', 100)->nullable();
            $table->unsignedBigInteger('nik')->nullable(); 
            $table->string('kitas', 11)->nullable();
            $table->string('place_of_birth', 100);
            $table->date('date_of_birth');
            $table->string('age', 25);
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->string('phone_number', 20);
            $table->string('email', 100);
            $table->string('previous_school', 100);
            $table->string('religion', 30);
            $table->string('registration_id', 100);
            $table->string('academic_status_other', 50)->nullable();
            $table->enum('enrollment_status', ['ACTIVE','TRANSFEREE','GRADUATE','UNREGISTER']);
            $table->enum('student_status', ['New','Old','Transferee']);
            $table->enum('academic_status', ['REGULAR','SIT-IN','OTHER']);
            $table->timestamp('registration_date')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
