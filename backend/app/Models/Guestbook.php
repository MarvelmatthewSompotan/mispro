<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guestbook extends Model
{
    protected $table = 'guestbook';
    protected $primaryKey = 'guestbook_id';

    public $timestamps = true;

    protected $fillable = [
        'date_visit',
        'address',
        'contact',
        'remarks',
        'created_by',
    ];

    // 🔗 RELATION: Visitors
    public function visitors() : HasMany
    {
        return $this->hasMany(
            GuestbookVisitor::class,
            'guestbook_id',
            'guestbook_id'
        );
    }

    // 🔗 RELATION: Students
    public function students() : HasMany
    {
        return $this->hasMany(
            GuestbookStudent::class,
            'guestbook_id',
            'guestbook_id'
        );
    }

    // 🔗 RELATION: User (creator)
    public function creator() : BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by',
            'user_id'
        );
    }
}