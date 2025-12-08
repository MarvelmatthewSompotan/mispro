<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('gate_sessions', 'exit_threshold_map')) {
                $table->json('exit_threshold_map')->nullable()->after('exit_threshold');
            }
        });
    }

    public function down(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('gate_sessions', 'exit_threshold_map')) {
                $table->dropColumn('exit_threshold_map');
            }
        });
    }
};
