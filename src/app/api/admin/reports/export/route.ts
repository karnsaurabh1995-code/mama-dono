import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import writeExcelFile, { Row } from 'write-excel-file/node';

export const dynamic = 'force-dynamic';

function sanitizeForSpreadsheet(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

function csvEscape(val: unknown): string {
  const sanitized = sanitizeForSpreadsheet(val);
  if (sanitized.includes('"') || sanitized.includes(',') || sanitized.includes('\n') || sanitized.includes('\r')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authorizedRoles = ['super_admin', 'admin', 'finance', 'campaign_manager', 'support_admin'];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Finance or Administrator credentials required.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'donations_ledger';
    const format = (searchParams.get('format') || 'xlsx').toLowerCase();
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const campaignId = searchParams.get('campaignId') || '';
    const statusFilter = searchParams.get('status') || '';
    const categoryFilter = searchParams.get('category') || '';
    const tagFilter = searchParams.get('tag') || '';

    // Date filtering helper
    const isWithinDateRange = (isoString?: string) => {
      if (!isoString) return true;
      const targetTime = new Date(isoString).getTime();
      if (startDate && targetTime < new Date(startDate).getTime()) return false;
      if (endDate && targetTime > new Date(endDate + 'T23:59:59Z').getTime()) return false;
      return true;
    };

    let filenameBase = `dokind-${reportType}-${new Date().toISOString().slice(0, 10)}`;

    // ---------------- REPORT 1: DONATIONS LEDGER ----------------
    if (reportType === 'donations_ledger') {
      let donations = db.getDonations();
      if (campaignId && campaignId !== 'all') donations = donations.filter((d) => d.campaignId === campaignId);
      if (statusFilter && statusFilter !== 'all') donations = donations.filter((d) => d.status === statusFilter);
      donations = donations.filter((d) => isWithinDateRange(d.createdAt));

      const headers = ['Donation ID', 'Receipt #', 'Date & Time', 'Donor Name', 'Donor Email', 'Donor Phone', 'Donor PAN', 'Campaign ID', 'Campaign Title', 'Amount (INR)', 'Tip (INR)', 'Payment Method', 'Gateway Order ID', 'Status', '80G Eligible'];

      if (format === 'csv') {
        const rows = donations.map((d) => [
          d.id,
          d.receiptNumber,
          d.createdAt,
          d.isAnonymous ? 'Anonymous Donor' : d.donorName,
          d.donorEmail,
          d.donorPhone || 'N/A',
          d.donorPan || 'N/A',
          d.campaignId,
          d.campaignTitle,
          d.amount,
          d.tipAmount || 0,
          d.paymentMethod,
          d.razorpayOrderId || 'N/A',
          d.status,
          d.taxExemption80G ? 'YES' : 'NO',
        ]);
        const csvText = '\uFEFF' + [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\r\n');
        return new Response(csvText, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
          },
        });
      }

      // Excel XLSX Multi-sheet
      const summaryData: Row[] = [
        [{ value: 'Dokind Platform — Donations Ledger Export', fontWeight: 'bold' }],
        [{ value: `Exported By: ${session.name} (${session.role})` }],
        [{ value: `Export Date: ${new Date().toISOString()}` }],
        [{ value: `Date Range Filter: ${startDate || 'All Time'} to ${endDate || 'Present'}` }],
        [{ value: `Total Filtered Records: ${donations.length}` }],
        [{ value: `Total Gross Volume: ₹${donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString('en-IN')}` }],
      ];

      const headerRow: Row = headers.map((h) => ({ value: h, fontWeight: 'bold' }));
      const detailRows: Row[] = donations.map((d) => [
        { value: sanitizeForSpreadsheet(d.id), type: String },
        { value: sanitizeForSpreadsheet(d.receiptNumber), type: String },
        { value: sanitizeForSpreadsheet(d.createdAt), type: String },
        { value: sanitizeForSpreadsheet(d.isAnonymous ? 'Anonymous Donor' : d.donorName), type: String },
        { value: sanitizeForSpreadsheet(d.donorEmail), type: String },
        { value: sanitizeForSpreadsheet(d.donorPhone || 'N/A'), type: String },
        { value: sanitizeForSpreadsheet(d.donorPan || 'N/A'), type: String },
        { value: sanitizeForSpreadsheet(d.campaignId), type: String },
        { value: sanitizeForSpreadsheet(d.campaignTitle), type: String },
        { value: Number(d.amount), type: Number },
        { value: Number(d.tipAmount || 0), type: Number },
        { value: sanitizeForSpreadsheet(d.paymentMethod), type: String },
        { value: sanitizeForSpreadsheet(d.razorpayOrderId || 'N/A'), type: String },
        { value: sanitizeForSpreadsheet(d.status), type: String },
        { value: sanitizeForSpreadsheet(d.taxExemption80G ? 'YES' : 'NO'), type: String },
      ]);

      const buffer = await writeExcelFile([
        { data: summaryData, sheet: 'Summary' },
        { data: [headerRow, ...detailRows], sheet: 'Donations Ledger' },
      ]).toBuffer();

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }

    // ---------------- REPORT 2: SECTION 80G TAX COMPLIANCE (FORM 10BE) ----------------
    if (reportType === 'tax_80g_compliance') {
      let donations = db.getDonations({ status: 'succeeded' }).filter((d) => d.taxExemption80G);
      if (campaignId && campaignId !== 'all') donations = donations.filter((d) => d.campaignId === campaignId);
      donations = donations.filter((d) => isWithinDateRange(d.createdAt));

      const headers = ['Receipt Number', 'Contribution Date', 'Donor Full Name', 'Donor PAN', 'Donor Email', 'Donor Mobile', 'Donor Address', 'Eligible Donation (INR)', 'Statutory Form 10BE Code', 'Section 80G Benefit %', 'Issuing NGO Trust', 'Trust PAN', '80G Approval URN'];

      if (format === 'csv') {
        const rows = donations.map((d) => [
          d.receiptNumber,
          d.createdAt.split('T')[0],
          d.donorName,
          d.donorPan || 'PAN_NOT_PROVIDED',
          d.donorEmail,
          d.donorPhone || 'N/A',
          (d as any).donorAddress || 'India',
          d.amount,
          '10BE-DOKIND-2026',
          '50% Deduction',
          'Dokind Foundation for Social Welfare',
          'AAATA4492M',
          'AAATA4492MF20215',
        ]);
        const csvText = '\uFEFF' + [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\r\n');
        return new Response(csvText, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
          },
        });
      }

      const summaryData: Row[] = [
        [{ value: 'Dokind Section 80G Statutory Tax Exemption Report', fontWeight: 'bold' }],
        [{ value: 'Compliance Basis: Form 10BE / Income Tax Act, 1961' }],
        [{ value: `Exported Date: ${new Date().toISOString()}` }],
        [{ value: `Qualified 80G Receipts: ${donations.length}` }],
        [{ value: `Total 80G Tax Deductible Value: ₹${donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString('en-IN')}` }],
      ];

      const headerRow: Row = headers.map((h) => ({ value: h, fontWeight: 'bold' }));
      const detailRows: Row[] = donations.map((d) => [
        { value: sanitizeForSpreadsheet(d.receiptNumber), type: String },
        { value: sanitizeForSpreadsheet(d.createdAt.split('T')[0]), type: String },
        { value: sanitizeForSpreadsheet(d.donorName), type: String },
        { value: sanitizeForSpreadsheet(d.donorPan || 'PAN_NOT_PROVIDED'), type: String },
        { value: sanitizeForSpreadsheet(d.donorEmail), type: String },
        { value: sanitizeForSpreadsheet(d.donorPhone || 'N/A'), type: String },
        { value: sanitizeForSpreadsheet((d as any).donorAddress || 'India'), type: String },
        { value: Number(d.amount), type: Number },
        { value: '10BE-DOKIND-2026', type: String },
        { value: '50% Deduction', type: String },
        { value: 'Dokind Foundation for Social Welfare', type: String },
        { value: 'AAATA4492M', type: String },
        { value: 'AAATA4492MF20215', type: String },
      ]);

      const buffer = await writeExcelFile([
        { data: summaryData, sheet: 'Tax Exemption Summary' },
        { data: [headerRow, ...detailRows], sheet: 'Form 10BE Records' },
      ]).toBuffer();

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }

    // ---------------- REPORT 3: CAMPAIGNS & FINANCIAL PERFORMANCE ----------------
    let campaigns = db.getCampaigns();
    if (statusFilter && statusFilter !== 'all') campaigns = campaigns.filter((c) => c.status === statusFilter);
    if (categoryFilter && categoryFilter !== 'all') campaigns = campaigns.filter((c) => c.category === categoryFilter);
    if (tagFilter && tagFilter !== 'all') campaigns = campaigns.filter((c) => (c.tags || []).includes(tagFilter));

    const curation = db.getHomepageCuration();

    const headers = ['Campaign ID', 'Title', 'Public Slug', 'Primary Category', 'Tags', 'Organizer', 'Status', 'Goal (INR)', 'Gross Raised (INR)', 'Net Proceeds (INR)', 'Funding %', 'Donors', 'In Hero', 'In Featured', 'In Urgent', 'Created Date'];

    if (format === 'csv') {
      const rows = campaigns.map((c) => {
        const net = c.netRaisedAmount || Math.round(c.raisedAmount * 0.95);
        const pct = Math.round((c.raisedAmount / c.goalAmount) * 100);
        return [
          c.id,
          c.title,
          c.slug,
          c.primaryCategory || c.category,
          (c.tags || []).join('; '),
          c.organizerName,
          c.status,
          c.goalAmount,
          c.raisedAmount,
          net,
          `${pct}%`,
          c.supporterCount,
          (curation.heroCampaignIds || []).includes(c.id) ? 'YES' : 'NO',
          (curation.featuredCampaignIds || []).includes(c.id) ? 'YES' : 'NO',
          (curation.urgentCampaignIds || []).includes(c.id) ? 'YES' : 'NO',
          c.createdAt.split('T')[0],
        ];
      });

      const csvText = '\uFEFF' + [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\r\n');
      return new Response(csvText, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    // Excel XLSX Multi-sheet for Campaigns
    const totalGoal = campaigns.reduce((sum, c) => sum + c.goalAmount, 0);
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
    const summaryData: Row[] = [
      [{ value: 'Dokind Platform — Campaign Performance & Finance Audit', fontWeight: 'bold' }],
      [{ value: `Export Generated: ${new Date().toISOString()}` }],
      [{ value: `Active Filter: Category: ${categoryFilter || 'All'} | Tag: ${tagFilter || 'All'} | Status: ${statusFilter || 'All'}` }],
      [{ value: `Campaigns Count: ${campaigns.length}` }],
      [{ value: `Aggregate Target Goal: ₹${totalGoal.toLocaleString('en-IN')}` }],
      [{ value: `Aggregate Raised Amount: ₹${totalRaised.toLocaleString('en-IN')}` }],
    ];

    const headerRow: Row = headers.map((h) => ({ value: h, fontWeight: 'bold' }));
    const detailRows: Row[] = campaigns.map((c) => {
      const net = c.netRaisedAmount || Math.round(c.raisedAmount * 0.95);
      const pct = Math.round((c.raisedAmount / c.goalAmount) * 100);
      return [
        { value: sanitizeForSpreadsheet(c.id), type: String },
        { value: sanitizeForSpreadsheet(c.title), type: String },
        { value: sanitizeForSpreadsheet(c.slug), type: String },
        { value: sanitizeForSpreadsheet(c.primaryCategory || c.category), type: String },
        { value: sanitizeForSpreadsheet((c.tags || []).join(', ')), type: String },
        { value: sanitizeForSpreadsheet(c.organizerName), type: String },
        { value: sanitizeForSpreadsheet(c.status), type: String },
        { value: Number(c.goalAmount), type: Number },
        { value: Number(c.raisedAmount), type: Number },
        { value: Number(net), type: Number },
        { value: `${pct}%`, type: String },
        { value: Number(c.supporterCount), type: Number },
        { value: (curation.heroCampaignIds || []).includes(c.id) ? 'YES' : 'NO', type: String },
        { value: (curation.featuredCampaignIds || []).includes(c.id) ? 'YES' : 'NO', type: String },
        { value: (curation.urgentCampaignIds || []).includes(c.id) ? 'YES' : 'NO', type: String },
        { value: sanitizeForSpreadsheet(c.createdAt.split('T')[0]), type: String },
      ];
    });

    const buffer = await writeExcelFile([
      { data: summaryData, sheet: 'Executive Summary' },
      { data: [headerRow, ...detailRows], sheet: 'Campaigns Audit' },
    ]).toBuffer();

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export generation error:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed.' }, { status: 500 });
  }
}
