<?php

namespace App\Jobs;

use App\Models\Gate\GateParentNotification;
use App\Services\Gate\WhatsAppGatewayService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class SendGateParentNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 600];

    private int $notificationId;

    public function __construct(int $notificationId)
    {
        $this->notificationId = $notificationId;
    }

    public function handle(WhatsAppGatewayService $gateway): void
    {
        $notification = GateParentNotification::find($this->notificationId);
        if (!$notification || $notification->status !== 'Pending') {
            return;
        }

        $result = $gateway->send($notification->recipient_contact, $notification->message_body);

        $notification->status = $result['success'] ? 'Sent' : 'Failed';
        $notification->sent_at = Carbon::now(config('app.timezone'));
        $notification->provider_response = is_string($result['body'])
            ? $result['body']
            : json_encode($result['body']);

        $notification->save();
    }

    public function failed(Throwable $exception): void
    {
        $notification = GateParentNotification::find($this->notificationId);
        if (!$notification) {
            return;
        }

        $notification->update([
            'status' => 'Failed',
            'sent_at' => Carbon::now(config('app.timezone')),
            'provider_response' => $exception->getMessage(),
        ]);
    }
}
