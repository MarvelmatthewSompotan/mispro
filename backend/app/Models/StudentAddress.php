<?php

namespace App\Models;

use App\Models\Student;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAddress extends Model
{
    protected $table = 'student_addresses';
    protected $primaryKey = 'student_address_id';
    public $timestamps = false;

    protected $fillable = [
        'student_address_id',
        'student_id',
        'street',
        'village',
        'district',
        'rt',
        'rw',
        'city_regency',
        'province',
        'other'
    ];

    public function student() : BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
