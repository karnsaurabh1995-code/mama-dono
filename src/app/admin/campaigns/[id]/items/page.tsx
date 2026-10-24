'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth/context';
import { Campaign, CampaignItemNeed, PhysicalItemPledge } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Truck,
  Check,
  Clock,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Send,
  Boxes,
} from 'lucide-react';

export default function AdminCampaignItemsFulfillmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [items, setItems] = useState<CampaignItemNeed[]>([]);
  const [pledges, setPledges] = useState<PhysicalItemPledge[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showProcureModal, setShowProcureModal] = useState<boolean>(false);
  const [showDeliverModal, setShowDeliverModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [actionQuantity, setActionQuantity] = useState<number>(50);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('essential-supplies');
  const [newItemUnit, setNewItemUnit] = useState('Kit');
  const [newItemPrice, setNewItemPrice] = useState<number>(500);
  const [newItemQty, setNewItemQty] = useState<number>(200);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImg, setNewItemImg] = useState(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
  );
  const [newItemMode, setNewItemMode] = useState<'financial_sponsor' | 'physical_goods' | 'both'>('both');

  const reloadData = () => {
    const foundCamp = db.getCampaignById(campaignId) || db.getCampaignBySlug(campaignId);
    if (foundCamp) {
      setCampaign(foundCamp);
      setItems([...db.getCampaignItemNeeds(foundCamp.id)]);
      setPledges([...db.getPhysicalItemPledges(foundCamp.id)]);
    }
  };

  useEffect(() => {
    reloadData();
  }, [campaignId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  if (!campaign) {
    return (
      <div className="bg-white p-12 text-center text-xs text-neutral-400 rounded-2xl border border-neutral-200">
        Campaign not found.
      </div>
    );
  }

  const analytics = db.getCampaignItemAnalytics(campaign.id);

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    db.createCampaignItemNeed(
      {
        campaignId: campaign.id,
        campaignSlug: campaign.slug,
        name: newItemName.trim(),
        category: newItemCategory,
        unit: newItemUnit.trim(),
        unitPrice: newItemPrice,
        quantityRequired: newItemQty,
        description: newItemDesc.trim(),
        imageUrl: newItemImg.trim(),
        donationMode: newItemMode,
        isActive: true,
        order: items.length + 1,
      },
      user?.name || 'Administrator'
    );

    reloadData();
    setShowAddModal(false);
    setNewItemName('');
    notify(`Created new item requirement: "${newItemName}"`);
  };

  // Toggle active
  const handleToggleActive = (item: CampaignItemNeed) => {
    db.updateCampaignItemNeed(item.id, { isActive: !item.isActive }, user?.name || 'Administrator');
    reloadData();
    notify(`Item "${item.name}" active status set to ${!item.isActive}`);
  };

  // Delete item
  const handleDeleteItem = (item: CampaignItemNeed) => {
    db.deleteCampaignItemNeed(item.id, user?.name || 'Administrator');
    reloadData();
    notify(
      item.quantityFunded > 0
        ? `Item listing deactivated (preserved ledger records).`
        : `Item listing removed.`
    );
  };

  // Record Procurement
  const handleRecordProcure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || actionQuantity <= 0) return;
    db.recordItemProcurement(selectedItemId, actionQuantity, actionNotes, user?.name || 'Administrator');
    reloadData();
    setShowProcureModal(false);
    setActionNotes('');
    notify(`Recorded purchase/procurement of ${actionQuantity} units.`);
  };

  // Record Delivery
  const handleRecordDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || actionQuantity <= 0) return;
    db.recordItemDelivery(selectedItemId, actionQuantity, actionNotes, evidenceUrl, user?.name || 'Administrator');
    reloadData();
    setShowDeliverModal(false);
    setActionNotes('');
    setEvidenceUrl('');
    notify(`Verified handover/delivery of ${actionQuantity} units to beneficiaries!`);
  };

  // Verify Physical Pledge
  const handleVerifyPledge = (pledgeId: string) => {
    db.verifyPhysicalItemPledge(pledgeId, user?.name || 'Administrator', 'Verified parcel arrival at NGO warehouse');
    reloadData();
    notify(`Physical shipment verified and added to delivered count!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns">
            <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-[#202124]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <Package className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Item Requirements & Fulfillment Manager
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
              {campaign.title}
            </h1>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Item Requirement
        </Button>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Items Needed</span>
          <div className="text-xl font-black text-[#202124] mt-1 font-mono">{analytics.totalItemsRequired}</div>
          <span className="text-[10px] text-neutral-500">Across {items.length} product lines</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Funded by Donors</span>
          <div className="text-xl font-black text-emerald-700 mt-1 font-mono">{analytics.totalItemsFunded}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{analytics.overallItemPercentage}% target achieved</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Procured / Purchased</span>
          <div className="text-xl font-black text-blue-600 mt-1 font-mono">{analytics.totalItemsProcured}</div>
          <span className="text-[10px] text-neutral-500">From wholesale suppliers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Delivered to Hands</span>
          <div className="text-xl font-black text-purple-700 mt-1 font-mono">{analytics.totalItemsDelivered}</div>
          <span className="text-[10px] text-purple-600 font-bold">Verified handover</span>
        </div>
      </div>

      {/* Item Requirements Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#202124]">Configured Product Requirements ({items.length})</h3>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No item requirements configured for this campaign yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Required Target</th>
                  <th className="py-3 px-4">Funded</th>
                  <th className="py-3 px-4">Procured</th>
                  <th className="py-3 px-4">Delivered</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#202124]">{it.name}</div>
                          <div className="text-[10px] text-neutral-400">{it.unit} • {it.donationMode.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#202124]">
                      {formatINR(it.unitPrice)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      {it.quantityRequired} {it.unit}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {it.quantityFunded}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {it.quantityProcured}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-purple-700">
                      {it.quantityDelivered}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          it.fulfillmentStatus === 'delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : it.fulfillmentStatus === 'procuring'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {it.fulfillmentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedItemId(it.id);
                            setShowProcureModal(true);
                          }}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100"
                          title="Record procurement from wholesale vendor"
                        >
                          Procure
                        </button>

                        <button
                          onClick={() => {
                            setSelectedItemId(it.id);
                            setShowDeliverModal(true);
                          }}
                          className="px-2 py-1 rounded bg-purple-50 text-purple-700 text-[10px] font-bold hover:bg-purple-100"
                          title="Record verified delivery to beneficiaries"
                        >
                          Deliver
                        </button>

                        <button
                          onClick={() => handleToggleActive(it)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            it.isActive ? 'bg-neutral-100 text-neutral-600' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {it.isActive ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteItem(it)}
                          className="p-1 rounded text-neutral-400 hover:text-red-600"
                          title="Deactivate / remove listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Physical Item Pledges Queue */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#202124]">
            Physical Goods Donated by Donors ({pledges.length})
          </h3>
          <span className="text-xs text-neutral-400">Mode B: In-Kind Parcel Tracking</span>
        </div>

        {pledges.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No physical parcel pledges submitted for this campaign yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-4">Donor Details</th>
                  <th className="py-3 px-4">Quantity Pledged</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                {pledges.map((plg) => (
                  <tr key={plg.id}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#202124]">{plg.donorName}</div>
                      <div className="text-[10px] text-neutral-400">{plg.donorEmail}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#202124]">
                      {plg.quantity} units
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-neutral-700">
                        {plg.shippingCarrier || 'Self Drop'}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {plg.trackingNumber || 'No tracking ID'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          plg.status === 'received_verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {plg.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {plg.status !== 'received_verified' ? (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyPledge(plg.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Verify Parcel Received
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-mono">
                          Verified by {plg.verifiedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- ADD ITEM MODAL ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleAddItem}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#202124]">Add Campaign Item Requirement</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Item Name *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Emergency Flood Ration Kit"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Unit Cost (₹) *</label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Target Quantity *</label>
                <input
                  type="number"
                  required
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Unit Label</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="e.g. Kit / Blanket / Bag"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202124]">Donation Mode</label>
                <select
                  value={newItemMode}
                  onChange={(e) => setNewItemMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                >
                  <option value="both">Both (Sponsor or Physical)</option>
                  <option value="financial_sponsor">Financial Sponsor Only</option>
                  <option value="physical_goods">Physical Delivery Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Description of Need</label>
              <textarea
                rows={2}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Items included in this package..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Photo URL</label>
              <input
                type="text"
                value={newItemImg}
                onChange={(e) => setNewItemImg(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white font-bold">
                Create Item
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- PROCURE MODAL ---------------- */}
      {showProcureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRecordProcure}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Boxes className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-[#202124]">Record Item Procurement</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Quantity Procured *</label>
              <input
                type="number"
                required
                min={1}
                value={actionQuantity}
                onChange={(e) => setActionQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Supplier / Invoice Reference Notes</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Invoice #PO-8829 from Haryana Textiles Ltd. Delivered to staging warehouse."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowProcureModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Confirm Procurement
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- DELIVER MODAL ---------------- */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleRecordDeliver}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E4E9] p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Truck className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-[#202124]">Record Handover & Delivery</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Quantity Handed Over *</label>
              <input
                type="number"
                required
                min={1}
                value={actionQuantity}
                onChange={(e) => setActionQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Distribution Drive / Location Notes</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Distributed across 4 flood relief camps in Barpeta with local panchayat signatures."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124]">Photo Proof / Evidence URL (Optional)</label>
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowDeliverModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Confirm Verified Delivery
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
