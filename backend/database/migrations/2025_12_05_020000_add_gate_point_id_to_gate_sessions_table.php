<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('gate_sessions', 'session_date')) {
                try {
                    $table->dropUnique('gate_sessions_session_date_unique');
                } catch (\Throwable $e) {
                    // ignore if unique not exists
                }
            }

            $table->unsignedBigInteger('gate_point_id')
                ->nullable()
                ->after('gate_session_id');

            $table->foreign('gate_point_id')
                ->references('gate_point_id')
                ->on('gate_points')
                ->nullOnDelete();

            $table->unique(['session_date', 'gate_point_id'], 'gate_sessions_date_gate_unique');
        });
    }

    public function down(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            $table->dropUnique('gate_sessions_date_gate_unique');
            $table->dropForeign(['gate_point_id']);
            $table->dropColumn('gate_point_id');
            $table->unique('session_date', 'gate_sessions_session_date_unique');
        });
    }
};

