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
        Schema::create('transportations', function (Blueprint $table) {
            $table->id('transport_id');
            $table->enum('type', ['Own car', 'School bus']);
            $table->unsignedBigInteger('pickup_point_id')->nullable();
            $table->foreign('pickup_point_id')->references('pickup_point_id')->on('pickup_points')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transportations');
    }
};
