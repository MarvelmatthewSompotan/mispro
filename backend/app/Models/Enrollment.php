<?php

namespace App\Models;

use App\Models\Program;
use App\Models\Student;
use App\Models\Semester;
use App\Models\SchoolYear;
use App\Models\SchoolClass;
use App\Models\DiscountType;
use App\Models\StudentPhoto;
use App\Models\ResidenceHall;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use App\Models\StudentDiscount;
use App\Models\StudentDocument;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Enrollment extends Model
{
    protected $table = 'enrollments';
    protected $primaryKey = 'enrollment_id';
    public $timestamps = false;

    protected $fillable = [
        'enrollment_id',
        'student_id',
        'class_id',
        'semester_id',
        'school_year_id',
        'program_id',
        'transport_id',
        'residence_id',
        'residence_hall_policy',
        'transportation_policy',
        'is_active'
    ];

    public function applicationForm() : HasOne
    {
        return $this->hasOne(ApplicationForm::class, 'enrollment_id', 'enrollment_id');
    }

    public function transportation() : BelongsTo
    {
        return $this->belongsTo(Transportation::class, 'transport_id', 'transport_id');
    }

    public function student() : BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function semester() : BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    public function schoolClass() : BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id', 'class_id');
    }

    public function schoolYear() : BelongsTo
    {
        return $this->belongsTo(SchoolYear::class, 'school_year_id', 'school_year_id');
    }

    public function residenceHall() : BelongsTo
    {
        return $this->belongsTo(ResidenceHall::class, 'residence_id', 'residence_id');
    }

    public function program() : BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function studentDiscount() : HasMany
    {
        return $this->hasMany(
        StudentDiscount::class, 'enrollment_id', 'enrollment_id');
    }

    public function discountTypes() : HasManyThrough
    {
        return $this->hasManyThrough(
        DiscountType::class, 
        StudentDiscount::class,
        'enrollment_id',
        'discount_type_id',
        'enrollment_id',
        'discount_type_id'
        );
    }

    public function studentDocument() : HasMany
    {
        return $this->hasMany(
        StudentDocument::class, 'enrollment_id', 'enrollment_id');
    }

    public function studentPhoto() : HasMany
    {
        return $this->hasMany(
        StudentPhoto::class, 'enrollment_id', 'enrollment_id');
    }

    public function getSectionAttribute()
    {
        return $this->schoolClass ? $this->schoolClass->section : null;
    }

    public function getMajorAttribute()
    {
        return $this->schoolClass ? $this->schoolClass->major : null;
    }

    public function getPickupPoint()
    {
        return $this->transportation ? $this->transportation->pickupPoint : null;
    }

}
