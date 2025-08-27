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

    // Relasi ke SchoolClass tetap ada (untuk data master)
    public function schoolClasses() : HasMany
    {
        return $this->hasMany(SchoolClass::class, 'section_id', 'section_id');
    }

    // Relasi langsung ke Enrollment (untuk pilihan user)
    public function enrollments() : HasMany
    {
        return $this->hasMany(Enrollment::class, 'section_id', 'section_id');
    }

    // Update method getStudentsAttribute
    public function getStudentsAttribute() 
    {
        return Student::whereIn(
            'student_id',
            $this->enrollments->pluck('student_id')->unique()
        )->get();
    }
}
