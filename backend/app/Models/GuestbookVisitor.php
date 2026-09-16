<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestbookVisitor extends Model
{
    protected $table = 'guestbook_visitors';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'guestbook_id',
        'name',
        'relation',
    ];

    public function guestbook() : BelongsTo
    {
        return $this->belongsTo(
            Guestbook::class,
            'guestbook_id',
            'guestbook_id'
        );
    }
}