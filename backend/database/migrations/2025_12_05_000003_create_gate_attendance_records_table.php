<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_attendance_records', function (Blueprint $table) {
            $table->id('gate_attendance_id');
            $table->unsignedBigInteger('gate_session_id');
            $table->unsignedBigInteger('student_id');
            $table->string('student_name', 150);
            $table->string('student_grade', 50)->nullable();
            $table->string('student_section', 50)->nullable();
            $table->enum('residency_status', ['Non Residence', 'Boys Dormitory', 'Girls Dormitory'])->nullable();
            $table->string('card_number', 50)->nullable();
            $table->unsignedBigInteger('entry_gate_id')->nullable();
            $table->timestamp('check_in_at')->nullable();
            $table->enum('entry_status', ['Present', 'Late', 'Not Present'])->default('Not Present');
            $table->unsignedBigInteger('exit_gate_id')->nullable();
            $table->timestamp('check_out_at')->nullable();
            $table->enum('exit_status', ['Checked Out', 'Early Leave', 'Not Checked Out'])->default('Not Checked Out');
            $table->enum('last_scan_type', ['Check In', 'Check Out'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['gate_session_id', 'student_id']);

            $table->foreign('gate_session_id')
                ->references('gate_session_id')
                ->on('gate_sessions')
                ->onDelete('cascade');

            $table->foreign('student_id')
                ->references('id')
                ->on('students')
                ->onDelete('cascade');

            $table->foreign('entry_gate_id')
                ->references('gate_point_id')
                ->on('gate_points')
                ->nullOnDelete();

            $table->foreign('exit_gate_id')
                ->references('gate_point_id')
                ->on('gate_points')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_attendance_records');
    }
};
