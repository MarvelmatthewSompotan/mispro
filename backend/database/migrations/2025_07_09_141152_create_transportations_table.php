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
            $table->enum('type', ['OWN CAR', 'SCHOOL BUS']);
            $table->enum('pickup_point', ['BITUNG 1', 'BITUNG 2', 'BITUNG 3', 'BITUNG 4', 'BITUNG 5','KEMA / MINAWEROT', 'UNKLAB / AIRMADIDI', 'TATELU / MATUNGKAS','MALL 1', 'MALL 2', 'MALL 3', 'MALL 4 / CITRALAND','STAR FOTO 1', 'STAR FOTO 2', 'TELING KAROMBASAN','MANDIRI 1', 'MANDIRI 2', 'MANDIRI 3','MGP 1', 'MGP 2', 'MGP 3', 'MGP 4', 'MGP 5 / TUMINTING', 'MGP 6','KUWIL / PEMDA', 'ASABRI / MAUMBI', 'DISTRICT M', 'TUMINTING','GRANDMAX 1503', 'GRANDMAX 1498', 'GRANDMAX 1407','VARSITY BITUNG', 'VARSITY MANADO', 'VARSITY KEMA'])->nullable();
            $table->enum('policy_signed', ['SIGNED', 'NOT SIGNED']);
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
