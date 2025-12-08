<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('gate_sessions', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }

            if (!Schema::hasColumn('gate_sessions', 'ended_by')) {
                $table->unsignedBigInteger('ended_by')->nullable()->after('check_out_count');

                $table->foreign('ended_by')
                    ->references('user_id')
                    ->on('users')
                    ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('gate_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('gate_sessions', 'ended_by')) {
                $table->dropForeign(['ended_by']);
                $table->dropColumn('ended_by');
            }

            if (!Schema::hasColumn('gate_sessions', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('check_out_count');

                $table->foreign('created_by')
                    ->references('user_id')
                    ->on('users')
                    ->onDelete('set null');
            }
        });
    }
};
