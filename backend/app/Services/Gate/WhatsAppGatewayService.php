<?php

namespace App\Services\Gate;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WhatsAppGatewayService
{
    /**
     * Kirim pesan WhatsApp via Fonnte.
     *
     * @return array{success:bool,status:int|null,body:mixed}
     */
    public function send(string $recipient, string $message): array
    {
        $token = config('services.fonnte.token');
        $url = config('services.fonnte.url');

        // Jika token/url tidak diset, anggap sukses (mock) untuk testing lokal.
        if (!$token || !$url) {
            return [
                'success' => true,
                'status' => null,
                'body' => 'Mock send (no gateway configured)',
            ];
        }

        try {
            // Fonnte memakai header Authorization: <token> (tanpa "Bearer")
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])
                ->asForm()
                ->post($url, [
                    'target' => $recipient,
                    'message' => $message,
                ]);

            $body = $response->json() ?? $response->body();
            $ok = $response->successful();

            // Beberapa gateway memberi status field "success" meski HTTP bukan 200
            if (!$ok && is_array($body) && isset($body['status'])) {
                $ok = Str::lower((string) $body['status']) === 'success';
            }

            return [
                'success' => $ok,
                'status' => $response->status(),
                'body' => $body,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'status' => null,
                'body' => $e->getMessage(),
            ];
        }
    }
}
