<?php

namespace App\Models;

use App\Models\Section;
use App\Models\Enrollment;
use App\Models\Major;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolClass extends Model
{
    protected $table = 'classes';
    protected $primaryKey = 'class_id';
    public $timestamps = false;

    protected $fillable = [
        'class_id',
        'section_id',
        'grade',
        'major_id',
    ];

    public function enrollments() : HasMany
    {
        return $this->hasMany(
            Enrollment::class,
            'class_id',
            'class_id',
        );
    }

    public function section() : BelongsTo
    {
        return $this->belongsTo(
            Section::class,
            'section_id',
            'section_id',
        );
    }

    public function students() : HasManyThrough
    {
        return $this->hasManyThrough(
            Student::class,
            Enrollment::class,
            'class_id',
            'student_id',
            'class_id',
            'student_id',
        );
    } 

    public function major(): BelongsTo 
    {
        return $this->belongsTo(
            Major::class,
            'major_id',
            'major_id',

        );

    }

}
