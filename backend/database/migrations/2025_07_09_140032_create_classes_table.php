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
        Schema::create('classes', function (Blueprint $table) {
            $table->id('class_id');
            $table->string('class_name', 25);
            $table->unsignedBigInteger('section_id')->nullable();
            $table->unsignedBigInteger('major_id')->nullable();
            $table->foreign('section_id')->references('section_id')->on('sections')->onDelete('set null');
            $table->foreign('major_id')->references('major_id')->on('majors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
