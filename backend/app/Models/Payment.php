<?php

namespace App\Models;

use App\Models\Student;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $timestamps = false;

    protected $fillable = [
        'payment_id',
        'student_id',
        'type',
        'method',
        'amount',
        'policy_signed'
    ];

    public function student() : BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
