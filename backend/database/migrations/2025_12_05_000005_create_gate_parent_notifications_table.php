<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_parent_notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('gate_attendance_id');
            $table->string('recipient_contact', 150);
            $table->enum('message_type', ['Check In', 'Check Out']);
            $table->text('message_body');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['Pending', 'Sent', 'Failed'])->default('pending');
            $table->text('provider_response')->nullable();
            $table->timestamps();

            $table->foreign('gate_attendance_id')
                ->references('gate_attendance_id')
                ->on('gate_attendance_records')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_parent_notifications');
    }
};

