<?php

namespace App\Listeners;

use App\Models\SchoolYear;
use Illuminate\Support\Facades\Cache;
use App\Events\ApplicationFormCreated;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Events\ApplicationFormStatusUpdated;
use App\Http\Controllers\DashboardController;

class InvalidateDashboardCache
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        \Log::info('InvalidateDashboardCache listener triggered', [
            'event' => get_class($event),
        ]);
        
        if ($event instanceof ApplicationFormCreated) {
            $applicationForm = $event->applicationForm;
            $reason = 'new registration created';
        } elseif ($event instanceof ApplicationFormStatusUpdated) {
            $applicationForm = $event->applicationForm;
            $reason = "status changed from {$event->oldStatus} to {$event->newStatus}";
        } else {
            return;
        }

        $schoolYear = $applicationForm->enrollment->schoolYear->year ?? 'unknown';
        $schoolYears = SchoolYear::pluck('year');
        $controller = new DashboardController();
        
        foreach ($schoolYears as $year) {
            $controller->forgetDashboardCacheByYear($year);
        }

        \Log::info("Dashboard cache invalidated due to {$reason} (school year: {$schoolYear})");
    }
}
