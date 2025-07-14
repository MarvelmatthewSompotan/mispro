<?php

namespace App\Models;

use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class FatherAddress extends Model
{
    protected $table = 'father_addresses';
    protected $primaryKey = 'father_address_id';
    public $timestamps = false;

    protected $fillable = [
        'father_address_id',
        'parent_id',
        'street',
        'village',
        'district',
        'rt_rw',
        'city_regency',
        'province',
        'postal_code',
        'other',
    ];

    public function parent() : BelongsTo
    {
        return $this->belongsTo(StudentParent::class, 'parent_id', 'parent_id');
    }

    public function student() : HasOneThrough
    {
        return $this->hasOneThrough(
            Student::class, 
            StudentParent::class, 
            'parent_id', 
            'student_id', 
            'parent_id', 
            'student_id'
        );
    }
}
