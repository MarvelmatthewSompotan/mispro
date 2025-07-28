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
        Schema::create('father_addresses', function (Blueprint $table) {
            $table->id('father_address_id');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('street', 100);
            $table->string('village', 100);
            $table->string('district', 100);
            $table->string('rt', 20);
            $table->string('rw', 20);
            $table->string('city_regency', 100);
            $table->string('province', 100);
            $table->text('other')->nullable();
            $table->foreign('parent_id')->references('parent_id')->on('parents')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('father_addresses');
    }
};
