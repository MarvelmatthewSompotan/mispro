<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Cache;
use App\Events\ApplicationFormCreated;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

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
    public function handle(ApplicationFormCreated $event): void
    {
        $applicationForm = $event->applicationForm;
        $schoolYear = $applicationForm->enrollment->schoolYear->year ?? 'unknown';

        Cache::flush();

        \Log::info("Dashboard cache flushed globally due to new registration for school year: {$schoolYear}");
    }
}
