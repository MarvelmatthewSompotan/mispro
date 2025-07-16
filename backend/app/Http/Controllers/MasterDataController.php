<?php

namespace App\Http\Controllers;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;

class MasterDataController extends Controller
{
    public function getSections()
    {
        return response()->json(Section::all());
    }

    public function getPrograms()
    {
        return response()->json(Program::all());
    }

    public function getMajors()
    {
        return response()->json(Major::all());
    }

    public function getTransportations()
    {
        return response()->json(Transportation::all());
    }

    public function getResidenceHalls()
    {
        return response()->json(ResidenceHall::all());
    }
}
