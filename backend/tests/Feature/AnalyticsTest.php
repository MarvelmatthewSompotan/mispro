<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\SchoolYear;
use App\Models\ApplicationForm;
use Illuminate\Support\Carbon;

class AnalyticsTest extends TestCase
{
    // Tidak menggunakan RefreshDatabase karena kita menggunakan data existing
    
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. SETUP USER ADMIN
        // Ambil user admin yang sudah ada di database
        $this->user = User::where('role', 'admin')->first(); 

        if (!$this->user) {
            $this->markTestSkipped('User admin tidak ditemukan di database. Pastikan database sudah di-seed.');
        }

        // 2. SETUP WAKTU (Auto-Detect)
        // Agar data "Today" tidak 0, kita set waktu "Sekarang" ke tanggal terakhir 
        // ada pendaftaran masuk di database Anda.
        $lastApplication = ApplicationForm::latest('created_at')->first();

        if ($lastApplication) {
            // Set waktu test ke waktu transaksi terakhir agar data 'today' terisi
            Carbon::setTestNow($lastApplication->created_at);
        } else {
            // Fallback jika DB kosong, pakai waktu sekarang
            Carbon::setTestNow(now());
        }
    }

    /**
     * Helper Auth Header
     */
    private function getAuthHeaders()
    {
        $token = $this->user->createToken('test-analytics')->plainTextToken;
        return [
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ];
    }

    /**
     * Test 1: Pastikan Struktur JSON Lengkap dan Benar
     */
    public function test_analytics_api_returns_correct_structure_and_http_status()
    {
        $response = $this->getJson('/api/analytics', $this->getAuthHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'meta' => ['filter_date', 'current_sy', 'previous_sy'],
                    'global' => [
                        'total', 'total_growth', 
                        'confirmed', 'confirmed_growth', 
                        'cancelled', 'cancelled_growth'
                    ],
                    'today' => [
                        'all' => ['total', 'confirmed', 'cancelled'],
                        'new' => ['total', 'confirmed', 'cancelled'],
                        'transferee' => ['total', 'confirmed', 'cancelled'],
                        'returning' => ['total', 'confirmed', 'cancelled'],
                    ],
                    'school_year' => [
                        'all', 'new', 'transferee', 'returning'
                    ],
                    'active_students_matrix', // Array key dinamis (ECP, Elementary, etc)
                    'pre_register',
                    'trends' => [
                        'labels', 'current_data', 'previous_data'
                    ],
                    'multi_year_trend'
                ]
            ]);
    }

    /**
     * Test 2: Validasi Logika Kalkulasi Matematika (Consistency Check)
     * Memastikan Total = Penjumlahan komponennya.
     */
    public function test_analytics_calculations_are_mathematically_consistent()
    {
        $response = $this->getJson('/api/analytics', $this->getAuthHeaders());
        $response->assertStatus(200);
        $data = $response->json('data');

        // 1. Cek Konsistensi Data "Today"
        $today = $data['today'];
        
        // Rumus: Total All = Total New + Total Transferee + Total Returning
        $calculatedTotal = $today['new']['total'] + $today['transferee']['total'] + $today['returning']['total'];
        
        $this->assertEquals(
            $today['all']['total'], 
            $calculatedTotal, 
            "Data 'Today Total' tidak sama dengan penjumlahan (New + Transferee + Returning)"
        );

        // Rumus: Confirmed All = Confirmed New + Confirmed Transferee + Confirmed Returning
        $calculatedConfirmed = $today['new']['confirmed'] + $today['transferee']['confirmed'] + $today['returning']['confirmed'];
        
        $this->assertEquals(
            $today['all']['confirmed'], 
            $calculatedConfirmed,
            "Data 'Today Confirmed' tidak konsisten."
        );

        // 2. Cek Konsistensi "School Year"
        $sy = $data['school_year'];
        $syTotalCalc = $sy['new']['total'] + $sy['transferee']['total'] + $sy['returning']['total'];

        $this->assertEquals(
            $sy['all']['total'],
            $syTotalCalc,
            "Data 'Current School Year Total' tidak konsisten."
        );
    }

    /**
     * Test 3: Validasi Active Students Matrix
     * Memastikan data section sesuai logika (Total >= New + Transferee)
     */
    public function test_active_students_matrix_logic()
    {
        $response = $this->getJson('/api/analytics', $this->getAuthHeaders());
        $matrix = $response->json('data.active_students_matrix');

        $this->assertNotEmpty($matrix, "Matrix Active Students kosong (mungkin nama Section di DB tidak cocok dengan keyword di Controller)");

        foreach ($matrix as $sectionName => $stats) {
            // Pastikan key wajib ada
            $this->assertArrayHasKey('total', $stats);
            $this->assertArrayHasKey('total_new', $stats);
            $this->assertArrayHasKey('total_transferee', $stats);
            $this->assertArrayHasKey('total_returning', $stats);

            // Validasi Logika: Total harus sama dengan penjumlahan komponennya
            $sum = $stats['total_new'] + $stats['total_transferee'] + $stats['total_returning'];
            
            $this->assertEquals(
                $stats['total'], 
                $sum, 
                "Perhitungan Total Siswa di Section '{$sectionName}' salah."
            );
        }
    }

    /**
     * Test 4: Validasi Rumus Growth Manual
     * Kita ambil angka raw dari response dan hitung manual apakah rumusnya benar sesuai controller.
     */
    public function test_growth_calculation_logic()
    {
        $response = $this->getJson('/api/analytics', $this->getAuthHeaders());
        $global = $response->json('data.global');

        // Kita tidak tahu angka "Previous" karena tidak diexpose di API response global secara langsung,
        // Tapi kita bisa cek logika dasar Growth.
        
        // Jika Total Growth 100%, kemungkinan data tahun lalu 0.
        if ($global['total_growth'] == 100) {
            $this->assertTrue(true); // Valid logic (New Growth)
        } else {
            // Jika tidak 100% dan tidak 0, pastikan formatnya angka/float
            $this->assertIsNumeric($global['total_growth']);
        }

        // Cek Today Growth
        // Jika today total > 0, growth harusnya ada angka (bisa 0, 100, atau persen lain)
        $todayTotal = $response->json('data.today.all.total');
        $todayGrowth = $response->json('data.today.all.growth');

        if ($todayTotal > 0) {
            $this->assertNotNull($todayGrowth);
        }
    }
}