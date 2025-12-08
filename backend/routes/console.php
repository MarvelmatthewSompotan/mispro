<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('update:enrollment-status')->dailyAt('01:00');
Schedule::command('gate:sessions:create')->dailyAt('00:01'); //Jery
