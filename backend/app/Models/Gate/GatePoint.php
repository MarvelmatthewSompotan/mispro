<?php

namespace App\Models\Gate;

use App\Models\Gate\GateAttendance;
use App\Models\Gate\GateScanLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GatePoint extends Model
{
    protected $table = 'gate_points';
    protected $primaryKey = 'gate_point_id';

    protected $fillable = [
        'name',
    ];

    public function entryAttendances(): HasMany
    {
        return $this->hasMany(GateAttendance::class, 'entry_gate_id', 'gate_point_id');
    }

    public function exitAttendances(): HasMany
    {
        return $this->hasMany(GateAttendance::class, 'exit_gate_id', 'gate_point_id');
    }

    public function scanLogs(): HasMany
    {
        return $this->hasMany(GateScanLog::class, 'gate_point_id', 'gate_point_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(GateAssignment::class, 'gate_point_id', 'gate_point_id');
    }
}
