<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Transportation extends Model
{
    protected $table = 'transportations';
    protected $primaryKey = 'transport_id';
    public $timestamps = false;

    protected $fillable = [
        'transport_id',
        'type',
        'pickup_point',
        'policy_signed',
    ];

    public function students() : HasManyThrough
    {
        return $this->hasManyThrough(
            Student::class,
            Enrollment::class,
            'transport_id',
            'student_id',
            'transport_id',
            'student_id'
        );
    }

    public function enrollments() : HasMany
    {
        return $this->hasMany(
            Enrollment::class,
            'transport_id',
            'transport_id',
        );
    }
}
