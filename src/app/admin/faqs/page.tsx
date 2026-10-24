'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { FAQItem } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpDown,
  Home,
  Check,
  X,
  Eye,
  AlertCircle,
  MoveUp,
  MoveDown,
} from 'lucide-react';

export default function AdminFAQPage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQItem[]>(db.getFAQs());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [modalQuestion, setModalQuestion] = useState('');
  const [modalAnswer, setModalAnswer] = useState('');
  const [modalCategory, setModalCategory] = useState<FAQItem['category']>('donor');
  const [modalShowHomepage, setModalShowHomepage] = useState(true);
  const [modalIsActive, setModalIsActive] = useState(true);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const refreshFaqs = () => {
    setFaqs([...db.getFAQs()]);
  };

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setModalQuestion('');
    setModalAnswer('');
    setModalCategory('donor');
    setModalShowHomepage(true);
    setModalIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: FAQItem) => {
    setEditingFaq(item);
    setModalQuestion(item.question);
    setModalAnswer(item.answer);
    setModalCategory(item.category);
    setModalShowHomepage(item.showOnHomepage !== false);
    setModalIsActive(item.isActive !== false);
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalQuestion.trim() || !modalAnswer.trim()) return;

    if (editingFaq) {
      db.updateFAQ(
        editingFaq.id,
        {
          question: modalQuestion.trim(),
          answer: modalAnswer.trim(),
          category: modalCategory,
          showOnHomepage: modalShowHomepage,
          isActive: modalIsActive,
        },
        user?.name || 'Admin'
      );
      notify(`FAQ "${modalQuestion.substring(0, 30)}..." updated successfully.`);
    } else {
      db.createFAQ(
        {
          question: modalQuestion.trim(),
          answer: modalAnswer.trim(),
          category: modalCategory,
          showOnHomepage: modalShowHomepage,
          isActive: modalIsActive,
        },
        user?.name || 'Admin'
      );
      notify('New FAQ added to directory.');
    }

    refreshFaqs();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this FAQ?')) {
      db.deleteFAQ(id, user?.name || 'Admin');
      notify('FAQ successfully deleted.');
      refreshFaqs();
    }
  };

  const handleToggleHomepage = (faq: FAQItem) => {
    db.updateFAQ(
      faq.id,
      { showOnHomepage: faq.showOnHomepage === false ? true : false },
      user?.name || 'Admin'
    );
    notify(`FAQ homepage visibility toggled.`);
    refreshFaqs();
  };

  const handleToggleActive = (faq: FAQItem) => {
    db.updateFAQ(
      faq.id,
      { isActive: faq.isActive === false ? true : false },
      user?.name || 'Admin'
    );
    notify(`FAQ status toggled.`);
    refreshFaqs();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= faqs.length) return;

    const reordered = [...faqs];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;

    db.reorderFAQs(reordered.map((f) => f.id), user?.name || 'Admin');
    refreshFaqs();
    notify('FAQ order updated.');
  };

  // Filtered faqs
  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#E84B45]/10 text-[#E84B45]">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Content Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight mt-1">
            FAQ & Knowledge Base Management
          </h1>
          <p className="text-xs text-[#555B63] mt-0.5">
            Manage questions displayed on the homepage "Questions About Giving?" accordion and the complete public /faq portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/faq" target="_blank">
            <Button size="sm" variant="outline" className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-1" />
              View Live /faq
            </Button>
          </Link>
          <Button size="sm" onClick={handleOpenAddModal} className="bg-[#E84B45] hover:bg-[#BD302D] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New FAQ
          </Button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E4E9] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#202124] text-white'
                : 'bg-neutral-100 text-[#555B63] hover:bg-neutral-200'
            }`}
          >
            All Questions ({faqs.length})
          </button>
          {['donor', 'fundraiser', 'tax_80g', 'verification', 'payments'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#202124] text-white'
                  : 'bg-neutral-100 text-[#555B63] hover:bg-neutral-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#E84B45]"
          />
        </div>
      </div>

      {/* FAQ Cards Table / List */}
      <div className="bg-white rounded-2xl border border-[#E2E4E9] shadow-2xs overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {filteredFaqs.map((faq, idx) => (
            <div key={faq.id} className="p-5 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 text-neutral-400 shrink-0 mt-0.5">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-black disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === faqs.length - 1}
                    className="p-1 hover:text-black disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      {faq.category.replace('_', ' ')}
                    </span>
                    {faq.showOnHomepage !== false ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Home className="w-2.5 h-2.5" />
                        <span>Homepage</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        Help Center Only
                      </span>
                    )}
                    {faq.isActive !== false ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#202124]">
                    {faq.question}
                  </h3>
                  <p className="text-xs text-[#555B63] leading-relaxed line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                <button
                  onClick={() => handleToggleHomepage(faq)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                    faq.showOnHomepage !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                  }`}
                  title="Toggle Homepage Visibility"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{faq.showOnHomepage !== false ? 'Shown on Home' : 'Show on Home'}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(faq)}
                  className="p-2 rounded-xl text-xs text-[#202124] bg-white border border-[#E2E4E9] hover:bg-neutral-50 transition-colors"
                  title="Edit FAQ"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 rounded-xl text-xs text-rose-600 bg-white border border-[#E2E4E9] hover:bg-rose-50 transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="p-12 text-center text-xs text-[#555B63]">
              No FAQs matched your search or category filter.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-base font-bold text-[#202124]">
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={modalQuestion}
                  onChange={(e) => setModalQuestion(e.target.value)}
                  placeholder="e.g. Is my donation 80G tax deductible?"
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Category *
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value as any)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                >
                  <option value="donor">Donor & Giving</option>
                  <option value="fundraiser">Fundraiser & Campaigns</option>
                  <option value="tax_80g">Section 80G & Taxes</option>
                  <option value="verification">Verification & NGOs</option>
                  <option value="payments">Payment Methods & Refunds</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Detailed Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={modalAnswer}
                  onChange={(e) => setModalAnswer(e.target.value)}
                  placeholder="Provide a clear, helpful, transparent answer..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E4E9] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E84B45]"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalShowHomepage}
                    onChange={(e) => setModalShowHomepage(e.target.checked)}
                    className="rounded text-[#E84B45]"
                  />
                  <span className="font-semibold text-neutral-700">Display on Homepage Accordion</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                    className="rounded text-[#E84B45]"
                  />
                  <span className="font-semibold text-neutral-700">Active (Published)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#E84B45] hover:bg-[#BD302D] text-white">
                  {editingFaq ? 'Update FAQ' : 'Save FAQ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
