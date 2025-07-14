<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolYear extends Model
{

    protected $table = 'school_years';
    protected $primaryKey = 'school_year_id';
    public $timestamps = false;

    protected $fillable = [
        'school_year_id',
        'academic_year'
    ];

    public function students() : HasManyThrough 
    {
        return $this->hasManyThrough(
            Student::class,
            Enrollment::class,
            'school_year_id',
            'student_id',
            'school_year_id',
            'student_id'
        );
    }
    public function enrollments() : HasMany
    {
        return $this->hasMany(Enrollment::class, 'school_year_id', 'school_year_id');
    }
}
