<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SchoolClass;

class GuestbookStudent extends Model
{
    protected $table = 'guestbook_students';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'guestbook_id',
        'student_name',
        'class_id',
        'previous_school',
    ];

    public function guestbook() : BelongsTo
    {
        return $this->belongsTo(
            Guestbook::class,
            'guestbook_id',
            'guestbook_id'
        );
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id', 'class_id');
    }
}