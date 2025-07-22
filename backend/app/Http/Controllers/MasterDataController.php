<?php

namespace App\Http\Controllers;

use App\Models\Major;
use App\Models\Program;
use App\Models\Section;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use App\Models\ResidenceHall;
use App\Models\Transportation;

class MasterDataController extends Controller
{
    public function getRegistrationOption()
    {
        return response()->json([
            'programs' => Program::all(),
            'sections' => Section::all(),
            'majors' => Major::all(),
            'transportations' => Transportation::select('transport_id', 'type')->get(),
            'residence_halls' => ResidenceHall::all(),
            'class' => SchoolClass::with(['section', 'major'])->get(),
            'student_status' => ['New', 'Old', 'Transferee'],
            'academic_status' => ['REGULAR', 'SIT-IN', 'OTHER'],
            'gender' => ['MALE', 'FEMALE'],
            'transportation_policy' => ['Signed', 'Not Signed'],
            'residence_hall_policy' => ['Signed', 'Not Signed'],
            'payment_type' => ['Tuition Fee', 'Residence Hall'],
            'payment_method' => ['Full Payment', 'Installment'],
            'financial_policy_contract' => ['Signed', 'Not Signed'],
            'pickup_points' => [
                'Bitung 1: Bus #10 - Pusat Kota',
                'Bitung 2: Bus #11 - Pelabuhan',
                'Bitung 3: Bus #12 - Wangurer',
                'Bitung 4: Bus #13 - Girian',
                'Bitung 5: Bus #23 - Girian',
                'Bitung 6: Bus #14 - Pusat Kota',
                'Kema/Minawerot: Bus #15 - Kema 3',
                'Airmadidi/Agape/Unklab',
                'Tatelu: Bus #37 Pertigaan Pinily Tatelu',
                'Maumbi: Walanda Maramis - Maumbi',
                'Pemda/Kawangkoan/Asabri/Rizky',
                'Sunflower/Perkamil: SF Paal Dua - Martadinata',
                'MGP/Lapangan: MGP 1 - Bus #27 - Tamansari',
                'MGP/Lapangan: MGP 2 - Bus #28 - Adipura',
                'MGP/Lapangan: MGP 3 - Bus #26 - Lippo Plaza',
                'Tuminting/Kombos: Bus #25 & #38 - Gereja Torsina',
                'Bank Mandiri Sudirman (Manado): Bus #19 & #20',
                'Winangun/Teling/Karombasan: RS Advent Teling',
                'Citraland/Kantor Pemasaran Citraland',
                'Bank Niaga 1: Bus #21 - Starphoto',
                'Bank Niaga 2: Bus #22 - Starphoto',
                'Malalayang 1: Bus #30 - Lapangan Bantik',
                'Malalayang 2: Bus #31 - Lapangan Bantik',
                'Malalayang 3: Bus #32 - Lapangan Bantik',
            ],
        ]);
    }
}
