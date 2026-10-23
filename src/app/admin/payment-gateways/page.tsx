'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { PaymentGatewayConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Save,
  Key,
  Lock,
  Eye,
  EyeOff,
  History,
  Workflow,
  Sparkles,
} from 'lucide-react';

export default function PaymentGatewaysPage() {
  const { user } = useAuth();
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(db.getGateways());
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('razorpay');
  const [showSecretKey, setShowSecretKey] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [webhookEvent, setWebhookEvent] = useState('payment.captured');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const currentGateway = gateways.find((g) => g.id === selectedGatewayId) || gateways[0];

  const handleUpdate = (updates: Partial<PaymentGatewayConfig>) => {
    const updated = db.updateGatewayConfig(currentGateway.id, updates, user?.name || 'Admin');
    if (updated) {
      setGateways([...db.getGateways()]);
      notify(`Updated settings for ${currentGateway.name}.`);
    }
  };

  const handleSimulateWebhook = () => {
    setSimulatingWebhook(true);
    const mockPayload = {
      event: webhookEvent,
      gateway: currentGateway.id,
      payment_id: `pay_mock_${Date.now()}`,
      amount: 250000,
      currency: 'INR',
      status: 'captured',
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      const res = db.simulateGatewayWebhook(currentGateway.id, webhookEvent, mockPayload);
      setGateways([...db.getGateways()]);
      setSimulatingWebhook(false);
      notify(res.message);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <CreditCard className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Payment Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            Payment Gateways & Webhook Diagnostics
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Configure live credentials, sandbox test modes, supported payment channels, and simulate webhook verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSimulateWebhook}
            disabled={simulatingWebhook}
            className="text-xs bg-[#25845B] hover:bg-[#1E6B49] text-white"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            {simulatingWebhook ? 'Pinging...' : 'Simulate Test Webhook'}
          </Button>
        </div>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Gateway Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gateways.map((gw) => {
          const isSelected = gw.id === selectedGatewayId;
          return (
            <div
              key={gw.id}
              onClick={() => setSelectedGatewayId(gw.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white shadow-2xs ${
                isSelected ? 'border-[#E84B45] ring-2 ring-[#E84B45]/15' : 'border-[#E2E4E9] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">{gw.name}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    gw.isEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                  title={gw.isEnabled ? 'Active Gateway' : 'Disabled'}
                />
              </div>

              <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-400">
                <span className="font-mono">{gw.isTestMode ? 'Test Mode' : 'Live Production'}</span>
                <span
                  className={`font-semibold capitalize ${
                    gw.healthStatus === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {gw.healthStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gateway Config Form & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-black text-[#202124]">{currentGateway.name}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{currentGateway.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <span>Enabled</span>
                <input
                  type="checkbox"
                  checked={currentGateway.isEnabled}
                  onChange={(e) => handleUpdate({ isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#E84B45] focus:ring-[#E84B45]"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <span className="text-amber-700">Test Mode</span>
                <input
                  type="checkbox"
                  checked={currentGateway.isTestMode}
                  onChange={(e) => handleUpdate({ isTestMode: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                API Key ID / Merchant ID *
              </label>
              <input
                type="text"
                value={currentGateway.keyId}
                onChange={(e) => handleUpdate({ keyId: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-700">
                  Secret Key / Private Auth Token *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setShowSecretKey((prev) => ({
                      ...prev,
                      [currentGateway.id]: !prev[currentGateway.id],
                    }))
                  }
                  className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                >
                  {showSecretKey[currentGateway.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecretKey[currentGateway.id] ? 'Mask' : 'Reveal'}</span>
                </button>
              </div>
              <input
                type={showSecretKey[currentGateway.id] ? 'text' : 'password'}
                value={currentGateway.secretKey}
                onChange={(e) => handleUpdate({ secretKey: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Webhook HMAC Verification Secret
              </label>
              <input
                type="password"
                value={currentGateway.webhookSecret}
                onChange={(e) => handleUpdate({ webhookSecret: e.target.value })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#E84B45]"
              />
            </div>
          </div>

          {/* Fee & Limits Configuration */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Minimum Donation (INR)</label>
              <input
                type="number"
                value={currentGateway.minAmountINR}
                onChange={(e) => handleUpdate({ minAmountINR: Number(e.target.value) || 50 })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Maximum Per Transaction</label>
              <input
                type="number"
                value={currentGateway.maxAmountINR}
                onChange={(e) => handleUpdate({ maxAmountINR: Number(e.target.value) || 1000000 })}
                className="w-full bg-white border border-[#E2E4E9] rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Webhooks & Diagnostics Log (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E2E4E9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#E84B45]" />
              <span>Webhook Ingestion Log</span>
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">HMAC SHA256</span>
          </div>

          {/* Test Simulation Controls */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="block text-[11px] font-bold text-neutral-600">Event to Simulate</label>
            <div className="flex items-center gap-2">
              <select
                value={webhookEvent}
                onChange={(e) => setWebhookEvent(e.target.value)}
                className="flex-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="payment.captured">payment.captured</option>
                <option value="order.paid">order.paid</option>
                <option value="subscription.charged">subscription.charged</option>
                <option value="refund.processed">refund.processed</option>
              </select>
              <Button size="sm" onClick={handleSimulateWebhook} disabled={simulatingWebhook} className="text-xs">
                Send
              </Button>
            </div>
          </div>

          {/* Recent Webhook Events List */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {currentGateway.recentWebhooks.length === 0 ? (
              <p className="text-center py-8 text-neutral-400 text-xs italic">
                No recent webhook payloads received for this gateway.
              </p>
            ) : (
              currentGateway.recentWebhooks.map((wh) => (
                <div key={wh.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-neutral-900">{wh.event}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">
                      {wh.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono line-clamp-1">{wh.payloadPreview}</p>
                  <p className="text-[10px] text-neutral-400">{new Date(wh.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
