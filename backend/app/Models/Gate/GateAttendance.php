<?php

namespace App\Models\Gate;

use App\Models\Student;
use App\Models\Gate\GateSession;
use App\Models\Gate\GatePoint;
use App\Models\Gate\GateScanLog;
use App\Models\Gate\GateParentNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GateAttendance extends Model
{
    protected $table = 'gate_attendance_records';
    protected $primaryKey = 'gate_attendance_id';

    protected $fillable = [
        'gate_session_id',
        'student_id',
        'student_name',
        'student_grade',
        'student_section',
        'residency_status',
        'card_number',
        'entry_gate_id',
        'check_in_at',
        'entry_status',
        'exit_gate_id',
        'check_out_at',
        'exit_status',
        'last_scan_type',
        'notes',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(GateSession::class, 'gate_session_id', 'gate_session_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'id');
    }

    public function entryGate(): BelongsTo
    {
        return $this->belongsTo(GatePoint::class, 'entry_gate_id', 'gate_point_id');
    }

    public function exitGate(): BelongsTo
    {
        return $this->belongsTo(GatePoint::class, 'exit_gate_id', 'gate_point_id');
    }

    public function scanLogs(): HasMany
    {
        return $this->hasMany(GateScanLog::class, 'gate_attendance_id', 'gate_attendance_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(GateParentNotification::class, 'gate_attendance_id', 'gate_attendance_id');
    }
}
