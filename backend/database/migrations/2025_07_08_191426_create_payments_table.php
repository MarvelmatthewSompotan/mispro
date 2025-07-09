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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->string('student_id', 30);
            $table->enum('type', ['TUITION', 'DORMITORY']);
            $table->enum('method', ['FULL PAYMENT', 'INSTALLMENT']);
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->enum('policy_signed', ['SIGNED', 'NOT SIGNED']);
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
