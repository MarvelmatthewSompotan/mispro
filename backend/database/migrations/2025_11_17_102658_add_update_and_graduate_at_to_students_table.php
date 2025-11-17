<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->timestamp('update_at')
                ->nullable()
                ->after('registration_date')
                ->useCurrent();

            $table->timestamp('graduate_at')
                ->nullable()
                ->after('update_at')
                ->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['update_at', 'graduate_at']);
        });
    }
};
