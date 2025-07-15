<?php

namespace App\Models;

use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPhoto extends Model
{
    protected $table = 'student_photos';
    protected $primaryKey = 'photo_id';
    public $timestamps = true;

    const CREATED_AT = 'uploaded_at';
    const UPDATED_AT = 'uploaded_at';

    protected $fillable = [
        'photo_id',
        'enrollment_id',
        'file_path',
        'document_type'
    ];
    
    public function enrollment() : BelongsTo
    {
        return $this->belongsTo(
            Enrollment::class, 
            'enrollment_id', 
            'enrollment_id'
        );
    }
}
