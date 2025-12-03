<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_scan_logs', function (Blueprint $table) {
            $table->id('gate_scan_log_id');
            $table->unsignedBigInteger('gate_attendance_id');
            $table->unsignedBigInteger('gate_session_id');
            $table->unsignedBigInteger('gate_point_id')->nullable();
            $table->enum('scan_type', ['Check In', 'Check Out']);
            $table->timestamp('scan_time');
            $table->string('card_number', 50)->nullable();
            $table->text('payload')->nullable();
            $table->timestamps();

            $table->foreign('gate_attendance_id')
                ->references('gate_attendance_id')
                ->on('gate_attendance_records')
                ->onDelete('cascade');

            $table->foreign('gate_session_id')
                ->references('gate_session_id')
                ->on('gate_sessions')
                ->onDelete('cascade');

            $table->foreign('gate_point_id')
                ->references('gate_point_id')
                ->on('gate_points')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_scan_logs');
    }
};

