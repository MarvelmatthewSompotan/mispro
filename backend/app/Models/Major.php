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
        'name',
    ];

    /**
     * Relasi: major (1) → many classes
     */
    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'major_id', 'major_id');
    }

    /**
     * Relasi: major (1) → many enrollments melalui classes
     */
    public function enrollments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Enrollment::class,
            SchoolClass::class,
            'major_id', // FK di SchoolClass
            'class_id', // FK di Enrollment
            'major_id', // PK di Major
            'class_id'  // PK di SchoolClass
        );
    }

    /**
     * Accessor: Ambil semua student yang terkait dengan major ini
     */
    public function getStudentsAttribute()
    {
        return Student::whereIn(
            'student_id',
            $this->enrollments->pluck('student_id')->unique()
        )->get();
    }
}
