<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Guardian;
use App\Models\StudentGuardian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class GuardianAddress extends Model
{
    protected $table = 'guardian_addresses';
    protected $primaryKey = 'guardian_address_id';
    public $timestamps = false;

    protected $fillable = [
        'guardian_address_id',
        'guardian_id',
        'street',
        'village',
        'district',
        'rt_rw',
        'city_regency',
        'province',
        'postal_code',
        'other'
    ];

    public function studentGuardians() : HasManyThrough
    {
        return $this->hasManyThrough(
            StudentGuardian::class,
            Guardian::class,
            'guardian_id',
            'guardian_id',
            'guardian_address_id',
            'guardian_id'
        );
    }

    public function guardian() : BelongsTo
    {
        return $this->belongsTo(
            Guardian::class,
            'guardian_id',
            'guardian_id'
        );
    }

    public function getStudentsAttribute()
    {
        return Student::whereIn(
            'student_id',
            $this->studentGuardians->pluck('student_id')->unique()
        )->get();
    }

}
