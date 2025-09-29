<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('student_photos', function (Blueprint $table) {
            $table->id('photo_id');
            $table->unsignedBigInteger('enrollment_id')->nullable();
            $table->string('file_path', 255);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->foreign('enrollment_id')->references('enrollment_id')->on('enrollments')->onDelete('set null');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('student_photos');
    }
};
