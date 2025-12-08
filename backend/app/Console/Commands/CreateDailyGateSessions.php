<?php

namespace App\Console\Commands;

use App\Models\Gate\GatePoint;
use App\Models\Gate\GateSession;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CreateDailyGateSessions extends Command
{
    protected $signature = 'gate:sessions:create';
    protected $description = 'Create daily gate sessions for each gate point';

    public function handle(): int
    {
        $now = Carbon::now(config('app.timezone'));
        $today = $now->toDateString();

        GateSession::where('status', 'Ongoing')
            ->whereDate('session_date', '<', $today)
            ->each(function (GateSession $session) use ($now) {
                $session->update([
                    'status' => 'Ended',
                    'end_at' => $session->session_date
                        ? Carbon::parse($session->session_date, config('app.timezone'))->endOfDay()
                        : $now->copy()->subDay()->endOfDay(),
                ]);
            });

        GatePoint::all()->each(function (GatePoint $gatePoint) use ($today) {
            // Skip creating if any session already exists today for this gate (any status)
            $exists = GateSession::where('gate_point_id', $gatePoint->gate_point_id)
                ->whereDate('session_date', $today)
                ->exists();

            if (!$exists) {
                GateSession::create([
                    'gate_point_id' => $gatePoint->gate_point_id,
                    'session_date' => $today,
                    'start_at' => Carbon::parse($today, config('app.timezone'))->startOfDay(),
                    'status' => 'Ongoing',
                    'entry_threshold' => null,
                    'exit_threshold' => null,
                ]);

                $this->info("Created session for gate {$gatePoint->name}");
            }
        });

        return self::SUCCESS;
    }
}
