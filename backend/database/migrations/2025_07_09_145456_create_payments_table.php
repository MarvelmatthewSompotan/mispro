<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->string('student_id', 30)->nullable();
            $table->enum('tuition_fees', ['Full Payment', 'Installment']);
            $table->enum('residence_payment', ['Full Payment', 'Installment']);
            $table->enum('financial_policy_contract', ['Agree', 'Not Signed']);
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('set null');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
