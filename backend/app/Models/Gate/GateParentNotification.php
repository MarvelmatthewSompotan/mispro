<?php

namespace App\Models\Gate;

use App\Models\Gate\GateAttendance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GateParentNotification extends Model
{
    protected $table = 'gate_parent_notifications';
    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'gate_attendance_id',
        'recipient_contact',
        'message_type',
        'message_body',
        'sent_at',
        'status',
        'provider_response',
    ];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(GateAttendance::class, 'gate_attendance_id', 'gate_attendance_id');
    }
}
