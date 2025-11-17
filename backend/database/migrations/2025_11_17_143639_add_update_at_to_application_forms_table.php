<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('application_forms', function (Blueprint $table) {
            $table->timestamp('update_at')
                ->nullable()
                ->after('is_invalid_data'); 
        });
    }

    public function down(): void
    {
        Schema::table('application_forms', function (Blueprint $table) {
            $table->dropColumn('update_at');
        });
    }
};
