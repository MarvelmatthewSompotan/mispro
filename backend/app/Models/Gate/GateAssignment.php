<?php

namespace App\Models\Gate;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GateAssignment extends Model
{
    protected $table = 'gate_assignments';
    protected $primaryKey = 'gate_assignment_id';

    protected $fillable = [
        'gate_point_id',
        'user_id',
        'assignment_type',
    ];

    public function gatePoint(): BelongsTo
    {
        return $this->belongsTo(GatePoint::class, 'gate_point_id', 'gate_point_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
