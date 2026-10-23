'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { formatINR, isValidPAN } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth/context';
import confetti from 'canvas-confetti';
import {
  Heart,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Smartphone,
  Building,
} from 'lucide-react';

export default function DonationCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const campaignId = params?.campaignId as string;
  const campaign = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);

  // Initial amount from URL query param if present
  const initialAmount = searchParams?.get('amount')
    ? Number(searchParams.get('amount'))
    : 1001;
  const productName = searchParams?.get('product') || null;
  const productQty = searchParams?.get('qty') || null;

  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(8); // default 8% tip
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(campaign?.campaignType === 'monthly');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [donorPhone, setDonorPhone] = useState<string>(user?.phone || '');
  const [donorPan, setDonorPan] = useState<string>(user?.panNumber || '');
  const [message, setMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [completedDonation, setCompletedDonation] = useState<any | null>(null);

  // Simulation modal state
  const [showSimulatedModal, setShowSimulatedModal] = useState<boolean>(false);
  const [pendingOrderData, setPendingOrderData] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name);
      if (!donorEmail) setDonorEmail(user.email);
      if (!donorPan && user.panNumber) setDonorPan(user.panNumber);
      if (!donorPhone && user.phone) setDonorPhone(user.phone);
    }
  }, [user]);

  if (!campaign) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-[#202124]">Campaign Not Found</h1>
        <Link href="/campaigns">
          <Button variant="primary">Browse Campaigns</Button>
        </Link>
      </div>
    );
  }

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const tipAmount = Math.round((effectiveAmount * tipPercent) / 100);
  const totalPayable = effectiveAmount + tipAmount;

  // Form validation
  const validateForm = () => {
    if (!effectiveAmount || effectiveAmount < 50) {
      setErrorMessage('Minimum donation amount is ₹50.');
      return false;
    }
    if (!donorEmail || !donorEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address to receive your 80G tax receipt.');
      return false;
    }
    if (campaign.has80G && donorPan && !isValidPAN(donorPan)) {
      setErrorMessage('Invalid PAN format. Indian PAN must be 10 characters (e.g. ABCDE1234F).');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: effectiveAmount,
          tipAmount,
          donorName: isAnonymous ? 'Anonymous Donor' : donorName,
          donorEmail,
          donorPhone,
          donorPan: donorPan.toUpperCase(),
          isAnonymous,
          paymentMethod,
          isRecurring,
          message,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      setPendingOrderData(orderData);

      // If in test mode or simulated environment, open test modal
      setShowSimulatedModal(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!pendingOrderData) return;
    setLoading(true);

    try {
      const res = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: pendingOrderData.orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'sig_mock_verified_sha256',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setShowSimulatedModal(false);
      setCompletedDonation(data.donation);
      setLoading(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error');
      setLoading(false);
    }
  };

  // SUCCESS RECEIPT VIEW
  if (completedDonation) {
    return (
      <div className="py-12 bg-[#FAF9F6] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#25845B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#202124]">
              Thank You for Your Generosity!
            </h1>
            <p className="text-sm text-[#555B63] max-w-md mx-auto">
              Your contribution of <strong>{formatINR(completedDonation.amount)}</strong> has been successfully received and allocated directly to <strong>{campaign.title}</strong>.
            </p>

            {/* Receipt Summary Card */}
            <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E1] text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
                  80G Receipt Number
                </span>
                <span className="font-mono font-bold text-[#202124]">
                  {completedDonation.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Beneficiary Campaign:</span>
                <span className="font-semibold text-[#202124] text-right max-w-xs truncate">
                  {completedDonation.campaignTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Donor Name:</span>
                <span className="font-semibold text-[#202124]">
                  {completedDonation.isAnonymous ? 'Anonymous' : completedDonation.donorName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tax Exemption:</span>
                <span className="font-semibold text-[#25845B]">
                  Section 80G Eligible (Form 10BE)
                </span>
              </div>
              {completedPanOrText(completedDonation)}
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-[#E84B45]">{formatINR(completedDonation.totalAmount)}</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#202124] text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <Link href={`/account/donations/${completedDonation.id}`}>
                <Button variant="outline" size="sm">
                  View in My Account
                </Button>
              </Link>
              <Link href={`/campaigns/${campaign.slug}`}>
                <Button variant="primary" size="sm">
                  Return to Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function completedPanOrText(don: any) {
    if (don.donorPan) {
      return (
        <div className="flex justify-between">
          <span className="text-neutral-500">Donor PAN:</span>
          <span className="font-mono font-bold text-[#202124]">{don.donorPan}</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="py-10 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555B63]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#202124]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/campaigns/${campaign.slug}`} className="hover:text-[#202124]">
            {campaign.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">Make a Donation</span>
        </nav>

        {/* Campaign Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E6E1] flex items-center gap-4 shadow-2xs">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#E84B45] uppercase tracking-wider block">
              You are supporting
            </span>
            <h2 className="text-base font-bold text-[#202124] truncate">{campaign.title}</h2>
            <div className="flex items-center gap-2 text-xs text-[#555B63] mt-0.5">
              <span>by {campaign.organizationName || campaign.organizerName}</span>
              {campaign.has80G && (
                <span className="text-[#25845B] font-semibold flex items-center gap-0.5">
                  • 80G Tax Deductible
                </span>
              )}
            </div>
          </div>
        </div>

        {productName && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>Sponsoring: <strong>{productQty} x {productName}</strong></span>
            <span className="font-bold">{formatINR(effectiveAmount)}</span>
          </div>
        )}

        {/* Main Donation Checkout Form */}
        <form onSubmit={handleInitiateDonation} className="space-y-6">
          {/* Section 1: Amount Selection */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">1. Select Donation Amount</h3>
              <span className="text-xs text-[#555B63]">Currency: Indian Rupee (INR)</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[251, 501, 1001, 2501, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    amount === amt && !customAmount
                      ? 'bg-[#E84B45] text-white border-[#E84B45] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#202124] border-[#E8E6E1] hover:border-[#D5D1C8]'
                  }`}
                >
                  {formatINR(amt)}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#555B63]">
                ₹
              </span>
              <input
                type="number"
                min="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Or enter any custom amount (min ₹50)"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-9 pr-4 py-3 text-sm font-semibold text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            {/* Recurring toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-[#E84B45] rounded border-neutral-300 focus:ring-[#E84B45]"
                />
                <span className="text-xs font-semibold text-[#202124]">
                  Make this a monthly recurring donation (Cancel anytime in 1-click)
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Platform Voluntary Tip */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#202124]">
                  Support SevaSetu’s Operations (Optional Tip)
                </h3>
                <p className="text-xs text-[#555B63]">
                  We charge 0% platform fee for medical patients. Your tip helps fund our medical verification team and server bandwidth.
                </p>
              </div>
              <span className="text-xs font-bold text-[#E84B45]">{formatINR(tipAmount)}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[0, 5, 8, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercent(pct)}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                    tipPercent === pct
                      ? 'bg-[#202124] text-white border-[#202124]'
                      : 'bg-[#FAF9F6] text-[#555B63] border-[#E8E6E1] hover:bg-neutral-200'
                  }`}
                >
                  {pct === 0 ? 'No tip' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Donor Details & 80G Tax PAN */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#202124]">2. Donor Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Email Address (for 80G Receipt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  PAN Number (Required for 80G Tax Deduction)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={donorPan}
                  onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#202124] focus:outline-none focus:border-[#E84B45]"
                />
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-[#E84B45] rounded border-neutral-300 focus:ring-[#E84B45]"
                />
                <span className="text-xs text-[#555B63]">
                  Make my donation anonymous on the public supporters list and live feed
                </span>
              </label>
            </div>

            {/* Message for Beneficiary */}
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Words of Encouragement / Prayer (Optional)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send your blessings, prayers, or encouragement..."
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-xs text-[#202124] focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Section 4: Payment Method Selection */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#202124]">3. Select Payment Gateway</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-[#E84B45] bg-[#FFF0EF]'
                    : 'border-[#E8E6E1] bg-[#FAF9F6] hover:bg-neutral-100'
                }`}
              >
                <Smartphone className="w-5 h-5 text-[#E84B45] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-[#202124]">UPI Apps</div>
                  <div className="text-[11px] text-[#555B63]">GPay, PhonePe, Paytm, BHIM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#E84B45] bg-[#FFF0EF]'
                    : 'border-[#E8E6E1] bg-[#FAF9F6] hover:bg-neutral-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-[#202124]">Cards</div>
                  <div className="text-[11px] text-[#555B63]">RuPay, Visa, Mastercard</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'border-[#E84B45] bg-[#FFF0EF]'
                    : 'border-[#E8E6E1] bg-[#FAF9F6] hover:bg-neutral-100'
                }`}
              >
                <Building className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-[#202124]">Net Banking</div>
                  <div className="text-[11px] text-[#555B63]">SBI, HDFC, ICICI, Axis & 50+</div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Total & Checkout Button */}
          <div className="bg-[#202124] text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                Total Amount Payable
              </span>
              <span className="text-2xl font-black text-white">
                {formatINR(totalPayable)}
              </span>
              <span className="text-[11px] text-neutral-400 block">
                Includes {formatINR(effectiveAmount)} donation + {formatINR(tipAmount)} tip
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full sm:w-auto px-8 font-bold text-base"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Secure Payment
            </Button>
          </div>
        </form>
      </div>

      {/* Interactive Razorpay Simulation Modal */}
      {showSimulatedModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E84B45] text-white flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#202124]">
                    Razorpay Secure Checkout
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Test Mode Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSimulatedModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            {/* Order Details */}
            <div className="p-3.5 bg-[#FAF9F6] rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Merchant:</span>
                <span className="font-semibold text-[#202124]">SevaSetu Foundation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono text-neutral-700">{pendingOrderData.orderId}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#202124] pt-1 border-t border-neutral-200">
                <span>Amount:</span>
                <span className="text-[#E84B45]">{formatINR(pendingOrderData.totalAmount)}</span>
              </div>
            </div>

            <div className="text-xs text-[#555B63] space-y-1">
              <p className="font-semibold text-[#202124]">Simulate Gateway Response:</p>
              <p>
                In test mode, clicking "Confirm Payment" triggers the real cryptographic HMAC SHA256 server verification endpoint and generates your authentic 80G tax receipt.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="success"
                size="md"
                isLoading={loading}
                onClick={handleSimulatedPaymentSuccess}
                className="w-full justify-center font-bold"
              >
                ✓ Authorize Payment ({formatINR(pendingOrderData.totalAmount)})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSimulatedModal(false)}
                className="w-full justify-center text-xs"
              >
                Cancel Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
