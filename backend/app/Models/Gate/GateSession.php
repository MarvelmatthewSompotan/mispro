<?php

namespace App\Models\Gate;

use App\Models\Gate\GateAttendance;
use App\Models\Gate\GatePoint;
use App\Models\Gate\GateScanLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GateSession extends Model
{
    protected $table = 'gate_sessions';
    protected $primaryKey = 'gate_session_id';

    protected $fillable = [
        'gate_point_id',
        'session_date',
        'start_at',
        'end_at',
        'status',
        'entry_threshold',
        'exit_threshold',
        'exit_threshold_map',
        'check_in_count',
        'check_out_count',
        'ended_by',
    ];

    protected $casts = [
        'exit_threshold_map' => 'array',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(GateAttendance::class, 'gate_session_id', 'gate_session_id');
    }

    public function scanLogs(): HasMany
    {
        return $this->hasMany(GateScanLog::class, 'gate_session_id', 'gate_session_id');
    }

    public function endedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ended_by', 'user_id');
    }

    public function gatePoint(): BelongsTo
    {
        return $this->belongsTo(GatePoint::class, 'gate_point_id', 'gate_point_id');
    }
}
