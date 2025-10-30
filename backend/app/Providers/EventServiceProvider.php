<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\ApplicationFormCreated;
use App\Events\ApplicationFormStatusUpdated;
use App\Listeners\InvalidateDashboardCache;
use App\Events\UserLoggedIn;
use App\Listeners\InvalidateUserMetaCache;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UserLoggedIn::class => [
            InvalidateUserMetaCache::class,
        ],
        ApplicationFormCreated::class => [
            InvalidateDashboardCache::class,
        ],
        ApplicationFormStatusUpdated::class => [
            InvalidateDashboardCache::class,
        ],
    ];

    public function boot(): void
    {
    }
}
