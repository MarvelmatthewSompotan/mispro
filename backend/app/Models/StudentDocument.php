<?php

namespace App\Models;

use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDocument extends Model
{
    protected $table = 'student_documents';
    protected $primaryKey = 'document_id';
    public $timestamps = true;

    const CREATED_AT = null;
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'document_id',
        'enrollment_id ',
        'file_path',
        'document_type',
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
