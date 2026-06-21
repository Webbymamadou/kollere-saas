<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    // Create a subscription payment request (pending status)
    public function createPayment(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:monthly,yearly',
            'payment_method' => 'required|in:wave,orange_money,moov,mtn',
        ]);

        $user = $request->user();
        
        $amount = $request->plan === 'monthly' ? 9900 : 95040;

        $payment = SubscriptionPayment::create([
            'user_id' => $user->id,
            'plan' => $request->plan,
            'amount' => $amount,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        return response()->json([
            'payment' => $payment,
            'merchant_phone' => '770778341',
        ], 201);
    }

    // Get current user's payments
    public function getMyPayments(Request $request)
    {
        $user = $request->user();
        $payments = $user->subscriptionPayments()->latest()->get();
        return response()->json(['payments' => $payments]);
    }

    // --- ADMIN ENDPOINTS ---

    // Get all users with subscription status
    public function getUsers(Request $request)
    {
        if (!$request->user()->role === 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $users = User::where('role', 'owner')->with(['subscriptions', 'subscriptionPayments'])->latest()->get();
        return response()->json(['users' => $users]);
    }

    // Get all subscription payments (admin)
    public function getAllPayments(Request $request)
    {
        if (!$request->user()->role === 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $payments = SubscriptionPayment::with(['user', 'validatedBy'])->latest()->get();
        return response()->json(['payments' => $payments]);
    }

    // Approve a payment (admin only)
    public function approvePayment(Request $request, $paymentId)
    {
        if (!$request->user()->role === 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $payment = SubscriptionPayment::findOrFail($paymentId);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Ce paiement a déjà été traité.'], 400);
        }

        // Update payment
        $payment->update([
            'status' => 'approved',
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        // Activate subscription for user!
        $user = $payment->user;
        $endDate = $payment->plan === 'monthly' 
            ? now()->addMonth() 
            : now()->addYear();

        // Create subscription record
        Subscription::create([
            'user_id' => $user->id,
            'plan' => $payment->plan,
            'amount' => $payment->amount,
            'start_date' => now(),
            'end_date' => $endDate,
            'status' => 'active',
        ]);

        // Update user's subscription status
        $user->update(['subscription_status' => 'active']);

        return response()->json([
            'message' => 'Paiement approuvé et abonnement activé.',
            'payment' => $payment,
        ]);
    }

    // Reject a payment (admin only)
    public function rejectPayment(Request $request, $paymentId)
    {
        if (!$request->user()->role === 'admin') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $payment = SubscriptionPayment::findOrFail($paymentId);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Ce paiement a déjà été traité.'], 400);
        }

        $payment->update([
            'status' => 'rejected',
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
            'notes' => $request->notes ?? null,
        ]);

        return response()->json([
            'message' => 'Paiement refusé.',
            'payment' => $payment,
        ]);
    }
}
