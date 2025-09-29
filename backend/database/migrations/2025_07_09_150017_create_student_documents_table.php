<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedBigInteger('enrollment_id')->nullable();
            $table->string('file_path', 255);
            $table->string('document_type', 50);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->foreign('enrollment_id')->references('enrollment_id')->on('enrollments')->onDelete('set null');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('student_documents');
    }
};
