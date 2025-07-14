<?php

namespace App\Models;

use App\Models\Payment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Guardian;
use App\Models\Semester;
use App\Models\Enrollment;
use App\Models\SchoolYear;
use App\Models\SchoolClass;
use App\Models\DiscountType;
use App\Models\StudentPhoto;
use App\Models\FatherAddress;
use App\Models\MotherAddress;
use App\Models\ResidenceHall;
use App\Models\StudentParent;
use App\Models\StudentAddress;
use App\Models\Transportation;
use App\Models\ApplicationForm;
use App\Models\GuardianAddress;
use App\Models\StudentDiscount;
use App\Models\StudentDocument;
use App\Models\StudentGuardian;
use App\Models\ApplicationFormVersion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Student extends Model
{
    protected $table = 'students';
    protected $primaryKey = 'student_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    const CREATED_AT = 'registration_date';
    const UPDATED_AT = null;

    protected $fillable = [
        'student_id', 
        'nisn', 
        'first_name', 
        'middle_name', 
        'last_name', 
        'nickname', 
        'family_rank', 
        'citizenship', 
        'place_of_birth', 
        'date_of_birth', 
        'gender', 
        'phone_number', 
        'email', 
        'previous_school', 
        'religion', 
        'registration_number', 
        'student_status', 
        'academic_status', 
        'account_status'
    ];

    // Direct Relationships
    public function enrollments() : HasMany 
    {
        return $this->hasMany(Enrollment::class, 'student_id', 'student_id');
    }

    public function parent() : HasOne 
    {
        return $this->hasOne(StudentParent::class, 'student_id', 'student_id');
    }

    public function studentAddress() : HasOne 
    {
        return $this->hasOne(StudentAddress::class, 'student_id', 'student_id');
    }

    public function studentGuardian() : HasOne 
    {
        return $this->hasOne(StudentGuardian::class, 'student_id', 'student_id');
    }

    public function payment() : HasMany 
    {
        return $this->hasMany(Payment::class, 'student_id', 'student_id');
    }

    // Undirected Relationships
    public function applicationForms() : HasManyThrough
    {
        return $this->hasManyThrough(
            ApplicationForm::class,
            Enrollment::class,
            'student_id',
            'enrollment_id',
            'student_id',
            'enrollment_id'
        );
    }

    public function getApplicationFormVersionsAttribute()
    {
        return ApplicationFormVersion::whereIn(
            'application_id',
            $this->applicationForms->pluck('application_id')
        )->get();
    }

    public function studentDiscount() : HasManyThrough
    {
        return $this->hasManyThrough(
            StudentDiscount::class,
            Enrollment::class,
            'student_id',
            'enrollment_id',
            'student_id',
            'enrollment_id'
        );
    }

    public function getDiscountTypesAttribute()
    {
        return DiscountType::whereIn(
            'discount_type_id', 
            $this->studentDiscount->pluck('discount_type_id')
            )->get();
    }

    public function studentDocument() : HasManyThrough
    {
        return $this->hasManyThrough(
            StudentDocument::class,
            Enrollment::class,
            'student_id',
            'enrollment_id',
            'student_id',
            'enrollment_id'
        );
    }

    public function studentPhoto() : HasManyThrough
    {
        return $this->hasManyThrough(
            StudentPhoto::class,
            Enrollment::class,
            'student_id',
            'enrollment_id',
            'student_id',
            'enrollment_id'
        );
    }

    public function guardians() : BelongsToMany
    {
        return $this->belongsToMany(
            Guardian::class,
            'student_guardians',
            'student_id',
            'guardian_id',
            'student_id',
            'guardian_id'
        );
    }

    public function guardianAddress() : HasOneThrough
    {
        return $this->hasOneThrough(
            GuardianAddress::class,
            StudentGuardian::class,
            'student_id',
            'guardian_id',
            'student_id',
            'guardian_id'
        );
    }

    public function fatherAddress() : HasOneThrough
    {
        return $this->hasOneThrough(
            FatherAddress::class,
            StudentParent::class,
            'student_id',
            'parent_id',
            'student_id',
            'parent_id'
        );
    }

    public function motherAddress() : HasOneThrough
    {
        return $this->hasOneThrough(
            MotherAddress::class,
            StudentParent::class,
            'student_id',
            'parent_id',
            'student_id',
            'parent_id'
        );
    }

    public function transportations() : HasManyThrough
    {
        return $this->hasManyThrough(
            Transportation::class,
            Enrollment::class,
            'student_id',
            'transport_id',
            'student_id',
            'transport_id',
        );
    }

    public function semester() : HasManyThrough
    {
        return $this->hasManyThrough(
            Semester::class,
            Enrollment::class,
            'student_id',
            'semester_id',
            'student_id',
            'semester_id',
        );
    }

    public function schoolClass() : HasManyThrough
    {
        return $this->hasManyThrough(
            SchoolClass::class,
            Enrollment::class,
            'student_id',
            'class_id',
            'student_id',
            'class_id',
        );
    }

    public function getSectionsAttribute() 
    {
        return $this->schoolClass->map->section->unique('section_id');
    }

    public function schoolYears() : HasManyThrough
    {
        return $this->hasManyThrough(
            SchoolYear::class,
            Enrollment::class,
            'student_id',
            'school_year_id',
            'student_id',
            'school_year_id'
        );
    }

    public function residenceHalls() : HasManyThrough
    {
        return $this->hasManyThrough(
            ResidenceHall::class,
            Enrollment::class,
            'student_id',
            'residence_id',
            'student_id',
            'residence_id'
        );
    }

    public function programs() : HasManyThrough
    {
        return $this->hasManyThrough(
            Program::class,
            Enrollment::class,
            'student_id',
            'program_id',
            'student_id',
            'program_id'
        );
    }


};
