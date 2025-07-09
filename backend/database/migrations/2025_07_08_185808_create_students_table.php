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
            $table->string('nisn', 20)->nullable();
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50)->nullable();
            $table->string('nickname', 20)->nullable();
            $table->string('family_rank', 10)->nullable();
            $table->string('citizenship', 100)->nullable();
            $table->string('place_of_birth', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->text('address')->nullable();
            $table->unsignedBigInteger('city_id');
            $table->string('phone_number', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('previous_school', 100)->nullable();
            $table->string('religion', 30)->nullable();
            $table->string('registration_number', 100)->nullable();
            $table->enum('student_status', ['NEW','OLD','TRANSFEREE','INACTIVE','WITHDRAW']);
            $table->enum('academic_status', ['REGULAR','SIT-IN','OTHERS']);
            $table->enum('account_status', ['DEACTIVE','WAITING','ACTIVE','INACTIVE','WITHDRAW','GRADUATE']);
            $table->timestamp('registration_date')->useCurrent();
            $table->foreign('city_id')->references('city_id')->on('cities')->onDelete('cascade');
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
