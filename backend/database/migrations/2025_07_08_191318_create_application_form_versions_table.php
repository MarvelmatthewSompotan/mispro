<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('application_form_versions', function (Blueprint $table) {
            $table->id('version_id');
            $table->unsignedBigInteger('application_id');
            $table->dateTime('updated_at');
            $table->string('updated_by', 100)->nullable();
            $table->text('notes')->nullable();
            $table->json('data_snapshot');
            $table->foreign('application_id')->references('application_id')->on('application_forms')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_form_versions');
    }
};
