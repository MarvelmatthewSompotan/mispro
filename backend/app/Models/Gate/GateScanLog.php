<?php

namespace App\Models\Gate;

use App\Models\Gate\GateAttendance;
use App\Models\Gate\GateSession;
use App\Models\Gate\GatePoint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GateScanLog extends Model
{
    protected $table = 'gate_scan_logs';
    protected $primaryKey = 'gate_scan_log_id';

    protected $fillable = [
        'gate_attendance_id',
        'gate_session_id',
        'gate_point_id',
        'scan_type',
        'scan_time',
        'card_number',
        'payload',
    ];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(GateAttendance::class, 'gate_attendance_id', 'gate_attendance_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(GateSession::class, 'gate_session_id', 'gate_session_id');
    }

    public function gatePoint(): BelongsTo
    {
        return $this->belongsTo(GatePoint::class, 'gate_point_id', 'gate_point_id');
    }
}
