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

    // Relasi ke SchoolClass tetap ada (untuk data master)
    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'major_id', 'major_id');
    }

    // Relasi langsung ke Enrollment (untuk pilihan user)
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'major_id', 'major_id');
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
