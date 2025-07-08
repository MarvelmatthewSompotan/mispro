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
        Schema::create('student_discounts', function (Blueprint $table) {
            $table->id('student_discount_id');
            $table->unsignedBigInteger('enrollment_id');
            $table->unsignedBigInteger('discount_type_id');
            $table->decimal('value_percentage', 5, 2); // Contoh: 20.00 untuk 20%
            $table->text('notes')->nullable();
            $table->foreign('enrollment_id')->references('enrollment_id')->on('enrollments')->onDelete('cascade');
            $table->foreign('discount_type_id')->references('discount_type_id')->on('discount_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_discounts');
    }
};
