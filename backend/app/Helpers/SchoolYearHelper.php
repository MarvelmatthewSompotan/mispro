<?php

namespace App\Helpers;

use App\Models\SchoolYear;

class SchoolYearHelper
{
    /**
     * Mengembalikan current school year dalam format string "YYYY/YYYY"
     */
    public static function getCurrentSchoolYear(): ?string
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $schoolYearStr = ($currentMonth >= 7)
            ? $currentYear . '/' . ($currentYear + 1)
            : ($currentYear - 1) . '/' . $currentYear;

        $currentSchoolYear = SchoolYear::where('year', $schoolYearStr)->first();

        if (!$currentSchoolYear) {
            return null; // jika tidak ditemukan, kembalikan null
        }

        return $currentSchoolYear->year; // <-- sekarang return string "YYYY/YYYY"
    }
}