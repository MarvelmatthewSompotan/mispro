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
        Schema::create('guardian_addresses', function (Blueprint $table) {
            $table->id('guardian_address_id');
            $table->unsignedBigInteger('guardian_id')->nullable();
            $table->string('street', 100)->nullable();
            $table->string('village', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('rt_rw', 20)->nullable();
            $table->string('city_regency', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->text('other')->nullable();
            $table->foreign('guardian_id')->references('guardian_id')->on('guardians')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardian_addresses');
    }
};
