<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Enrollment;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Section extends Model
{
    protected $table = 'sections';
    protected $primaryKey = 'section_id';
    public $timestamps = false;

    protected $fillable = [
        'section_id',
        'name',
    ];

    public function schoolClasses() : HasMany
    {
        return $this->hasMany(SchoolClass::class, 'section_id', 'section_id');
    }

    public function enrollments() : HasManyThrough
    {
        return $this->hasManyThrough(
            Enrollment::class, 
            SchoolClass::class,
            'section_id', 
            'class_id',
            'section_id',
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
