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
        Schema::create('application_forms', function (Blueprint $table) {
            $table->id('application_id');
            $table->unsignedBigInteger('enrollment_id')->nullable();
            $table->enum('status', ['Draft', 'Submitted', 'Approved', 'Rejected']);
            $table->dateTime('submitted_at')->nullable();
            $table->integer('version')->default(1);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('enrollment_id')->references('enrollment_id')->on('enrollments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_forms');
    }
};
