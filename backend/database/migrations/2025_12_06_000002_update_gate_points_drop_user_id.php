<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gate_points', function (Blueprint $table) {
            if (Schema::hasColumn('gate_points', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('gate_points', function (Blueprint $table) {
            if (!Schema::hasColumn('gate_points', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('name');

                $table->foreign('user_id')
                    ->references('user_id')
                    ->on('users')
                    ->nullOnDelete();
            }
        });
    }
};
