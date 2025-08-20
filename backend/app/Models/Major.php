<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Major extends Model
{
    protected $table = 'majors';
    protected $primaryKey = 'major_id';
    public $timestamps = false;

    protected $fillable = [
        'major_id',
        'name',
    ];

    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'major_id', 'major_id');
    }

    public function enrollments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Enrollment::class,
            SchoolClass::class,
            'major_id', 
            'class_id', 
            'major_id', 
            'class_id'  
        );
    }

    public function getStudentsAttribute()
    {
        return Student::whereIn(
            'student_id',
            $this->enrollments->pluck('student_id')->unique()
        )->get();
    }
}
