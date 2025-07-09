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
        Schema::create('parents', function (Blueprint $table) {
            $table->id('parent_id');
            $table->string('student_id', 30);
            $table->string('father_name', 100)->nullable();
            $table->string('father_occupation', 100)->nullable();
            $table->string('father_company', 100)->nullable();
            $table->text('father_address')->nullable();
            $table->unsignedBigInteger('father_city_id')->nullable();
            $table->string('father_phone', 20)->nullable();
            $table->string('father_email', 100)->nullable();
            $table->string('mother_name', 100)->nullable();
            $table->string('mother_occupation', 100)->nullable();
            $table->string('mother_company', 100)->nullable();
            $table->text('mother_address')->nullable();
            $table->unsignedBigInteger('mother_city_id')->nullable();
            $table->string('mother_phone', 20)->nullable();
            $table->string('mother_email', 100)->nullable();
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            $table->foreign('father_city_id')->references('city_id')->on('cities')->onDelete('set null');
            $table->foreign('mother_city_id')->references('city_id')->on('cities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};
