<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gate_sessions', function (Blueprint $table) {
            $table->id('gate_session_id');
            $table->date('session_date');
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->enum('status', ['Ongoing', 'Paused', 'Ended'])->default('Ongoing');
            $table->time('entry_threshold')->nullable();
            $table->time('exit_threshold')->nullable();
            $table->unsignedInteger('check_in_count')->default(0);
            $table->unsignedInteger('check_out_count')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->unique('session_date');

            $table->foreign('created_by')
                ->references('user_id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gate_sessions');
    }
};

