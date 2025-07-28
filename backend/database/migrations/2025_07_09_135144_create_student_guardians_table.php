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
        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id('student_guardian_id');
            $table->string('student_id', 30); 
            $table->unsignedBigInteger('guardian_id');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('set null');
            $table->foreign('guardian_id')->references('guardian_id')->on('guardians')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
    }
};
