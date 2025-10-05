<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SchoolYear;
use App\Models\Enrollment;

class UpdateEnrollmentStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:enrollment-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update enrollment status (ACTIVE/INACTIVE) based on current school year';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $schoolYearStr = ($currentMonth >= 7)
            ? $currentYear . '/' . ($currentYear + 1)
            : ($currentYear - 1) . '/' . $currentYear;

        $currentSchoolYear = SchoolYear::where('year', $schoolYearStr)->first();

        if (!$currentSchoolYear) {
            $this->error("School year {$schoolYearStr} not found.");
            return 1; 
        }

        $currentId = $currentSchoolYear->school_year_id;

        // Update ACTIVE
        Enrollment::where('school_year_id', $currentId)
            ->update(['status' => 'ACTIVE']);

        // Update INACTIVE
        Enrollment::where('school_year_id', '!=', $currentId)
            ->update(['status' => 'INACTIVE']);

        $activeCount = Enrollment::where('status', 'ACTIVE')->count();
        $inactiveCount = Enrollment::where('status', 'INACTIVE')->count();

        $this->info("Enrollment status updated successfully.");
        $this->info("Current school year: {$schoolYearStr} (ID: {$currentId})");
        $this->info("ACTIVE: {$activeCount} | INACTIVE: {$inactiveCount}");


        return 0;
    }
}
