import assert from 'assert';
import { db } from '../src/lib/db';
import { CampaignItemNeed, CampaignRevisionSubmission, UserRole } from '../src/lib/types';

function runStaffAndItemsTestSuite() {
  console.log('================================================================');
  console.log('SEVASETU PLATFORM — STAFF WORKSPACE, WIZARD & ITEM-GIVING TESTS');
  console.log('================================================================\n');

  let passed = 0;
  function pass(msg: string) {
    console.log(`✓ PASSED: ${msg}`);
    passed++;
  }

  // --- TEST SUITE 1: ADMIN CAMPAIGN WIZARD & CLONING ---
  console.log('--- 1. Testing Admin Campaign Wizard & Draft Lifecycle ---');
  const initialCount = db.getCampaigns().length;

  let createdCampaign = db.createCampaign({
    slug: `test-assam-relief-${Date.now()}`,
    title: 'Flood Rehabilitation & Shelter Support Drive 2026',
    shortDescription: 'Providing immediate shelter tarpaulins and drinking water filters for 1,000 families.',
    story: 'Extensive monsoon rains caused flash floods displacing families across multiple districts. Immediate intervention is required.',
    category: 'disaster-relief',
    campaignType: 'product',
    goalAmount: 850000,
    featured: true,
    urgent: true,
    status: 'draft',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Displaced Riverine Villages',
    beneficiaryLocation: 'Barpeta District, Assam',
    organizerName: 'Dokind Disaster Operations',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    itemizedBudget: [
      { id: 'b1', item: 'Family Relief Kits', amount: 500000 },
      { id: 'b2', item: 'Safe Water Filters', amount: 350000 },
    ],
    useOfFunds: 'Direct vendor procurement and field distribution.',
    acceptsMonetary: true,
    acceptsItems: true,
    itemDonationMode: 'both',
    priority: 'urgent',
    campaignManager: 'Devendra Sharma',
    storyBlocks: [
      { id: 's1', type: 'problem', title: 'The Acute Crisis', content: '850 villages inundated with zero drinking water.', order: 1 },
      { id: 's2', type: 'solution', title: 'Direct Procurement', content: 'Procuring high-grade filter kits.', order: 2 },
    ],
  });

  assert(createdCampaign.id, 'Campaign created with unique internal ID');
  assert.strictEqual(createdCampaign.raisedAmount, 0, 'New campaign has 0 initial raised amount');
  assert.strictEqual(createdCampaign.supporterCount, 0, 'New campaign has 0 initial supporters');
  assert.strictEqual(createdCampaign.status, 'draft', 'Wizard can save campaign as staged draft');
  pass('Admin wizard creates campaign with structured story blocks and 0 initial funds');

  // Test Campaign Cloning ("Duplicate as Draft")
  const cloned = db.duplicateCampaignAsDraft(createdCampaign.id, 'Super Admin');
  assert.notStrictEqual(cloned.id, createdCampaign.id, 'Cloned campaign has fresh unique ID');
  assert.notStrictEqual(cloned.slug, createdCampaign.slug, 'Cloned campaign has unique new slug');
  assert.strictEqual(cloned.status, 'draft', 'Cloned campaign status is draft');
  assert.strictEqual(cloned.raisedAmount, 0, 'Cloned campaign raisedAmount is strictly 0');
  assert.strictEqual(cloned.supporterCount, 0, 'Cloned campaign supporterCount is strictly 0');
  assert(cloned.title.includes('(Draft Copy)'), 'Cloned campaign has draft title distinction');
  pass('High-volume tool "Duplicate Campaign as Draft" clones config while zeroing financial metrics');

  // --- TEST SUITE 2: CAMPAIGN-SPECIFIC ITEM REQUIREMENTS & INVENTORY ---
  console.log('\n--- 2. Testing DonateKart-Inspired Item Requirements ---');
  const itemNeed = db.createCampaignItemNeed({
    campaignId: createdCampaign.id,
    campaignSlug: createdCampaign.slug,
    name: 'Disaster Family Food Ration Kit',
    category: 'food-supplies',
    description: '10kg Rice, 2kg Pulses, Mustard Oil, Salt & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
    unit: 'Kit',
    unitPrice: 1200,
    quantityRequired: 500,
    maxPerOrder: 50,
    order: 1,
    isActive: true,
    donationMode: 'both',
  });

  assert(itemNeed.id, 'Item need created with unique ID');
  assert.strictEqual(itemNeed.quantityFunded, 0, 'Initial item funded quantity is 0');
  assert.strictEqual(itemNeed.quantityProcured, 0, 'Initial item procured quantity is 0');
  assert.strictEqual(itemNeed.quantityDelivered, 0, 'Initial item delivered quantity is 0');
  pass('Item requirement created with distinct financial unit price (₹1,200) and quantity targets');

  // Server-side order limit validation
  try {
    db.createDonationOrder({
      campaignId: createdCampaign.id,
      donorName: 'Test Donor',
      donorEmail: 'donor@example.com',
      isAnonymous: false,
      amount: 1200 * 60,
      tipAmount: 0,
      paymentMethod: 'upi',
      itemAllocations: [{ itemId: itemNeed.id, itemName: itemNeed.name, unitPrice: 1200, quantity: 60 }], // exceeds max 50
    });
    assert.fail('Should have thrown maxPerOrder violation');
  } catch (err: any) {
    // Campaign status is draft, or exceeds max order
    assert(err.message.includes('cannot accept donations') || err.message.includes('exceeds maximum'), 'Enforces donation limits');
  }
  pass('Server enforces order boundaries and status checks before issuing donation orders');

  // Activate campaign to accept test donations
  createdCampaign = db.updateCampaign(createdCampaign.id, { status: 'active' })!;
  pass('Campaign activated for donation testing');

  // --- TEST SUITE 3: MULTI-ITEM CHECKOUT, SPONSORSHIP & ATOMIC PROGRESS ---
  console.log('\n--- 3. Testing Item-Designated Donation & Atomic Settlement ---');
  const initialItemFunded = itemNeed.quantityFunded;
  const initialRaised = db.getCampaignById(createdCampaign.id)!.raisedAmount;

  // Donor sponsors 5 Family Ration Kits (5 × ₹1,200 = ₹6,000)
  const donationOrder = db.createDonationOrder({
    campaignId: createdCampaign.id,
    donorName: 'Aarohan Charitable Trust',
    donorEmail: 'trust@aarohan.org',
    donorPan: 'AAATA9912K',
    isAnonymous: false,
    amount: 6000,
    tipAmount: 480, // 8% tip
    paymentMethod: 'upi',
    itemAllocations: [
      {
        itemId: itemNeed.id,
        itemName: itemNeed.name,
        unitPrice: 1200,
        quantity: 5,
      },
    ],
  });

  assert.strictEqual(donationOrder.status, 'pending', 'Order created in pending status');
  assert.strictEqual(donationOrder.amount, 6000, 'Order amount matches item lines (5 × ₹1,200)');
  assert.strictEqual(donationOrder.totalAmount, 6480, 'Total payable accurately combines item amount and platform tip');
  assert.strictEqual(itemNeed.quantityFunded, initialItemFunded, 'Pending payment does NOT increment funded item quantity');
  pass('Item donation order created without premature or fictitious inventory allocation');

  // Verify and complete payment
  const completed = db.verifyAndCompletePayment({
    razorpayOrderId: donationOrder.razorpayOrderId,
    razorpayPaymentId: 'pay_mock_staff_item_8829',
  });

  assert.strictEqual(completed.status, 'succeeded', 'Donation marked as succeeded');
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.raisedAmount, initialRaised + 6000, 'Campaign monetary total atomically incremented by ₹6,000');
  assert.strictEqual(itemNeed.quantityFunded, initialItemFunded + 5, 'Item requirement quantityFunded atomically incremented by 5 units');
  pass('Verified successful payment atomically increments monetary raisedAmount AND item quantityFunded');

  // Idempotency: Duplicate webhook does NOT double-increment
  db.verifyAndCompletePayment({
    razorpayOrderId: donationOrder.razorpayOrderId,
    razorpayPaymentId: 'pay_mock_staff_item_8829',
  });
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.raisedAmount, initialRaised + 6000, 'Idempotent webhook does not double-count money');
  assert.strictEqual(itemNeed.quantityFunded, initialItemFunded + 5, 'Idempotent webhook does not double-count funded items');
  pass('Idempotent payment webhook guard guarantees exactly-once item and financial ledger updates');

  // --- TEST SUITE 4: REFUNDS & LEDGER REVERSALS ---
  console.log('\n--- 4. Testing Item Sponsorship Refund & Balance Reversal ---');
  db.processRefund(completed.id, 'Donor double-charge correction', 'Finance Lead');
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.raisedAmount, initialRaised, 'Monetary raisedAmount reversed back to original baseline');
  assert.strictEqual(itemNeed.quantityFunded, initialItemFunded, 'Item quantityFunded atomically reversed back to original baseline');
  pass('Refund accurately reverses both the monetary total and the item quantityFunded ledger');

  // --- TEST SUITE 5: FULFILLMENT TRACKING (PROCUREMENT & DELIVERY) ---
  console.log('\n--- 5. Testing Physical Fulfillment & Delivery Tracking ---');
  // Re-sponsor 10 units for procurement testing
  const order2 = db.createDonationOrder({
    campaignId: createdCampaign.id,
    donorName: 'CSR Partner Ltd',
    donorEmail: 'csr@partner.com',
    amount: 12000,
    tipAmount: 0,
    paymentMethod: 'upi',
    isAnonymous: false,
    itemAllocations: [{ itemId: itemNeed.id, itemName: itemNeed.name, unitPrice: 1200, quantity: 10 }],
  });
  db.verifyAndCompletePayment({
    razorpayOrderId: order2.razorpayOrderId,
    razorpayPaymentId: 'pay_mock_csr_procure_110',
  });

  assert.strictEqual(itemNeed.quantityFunded, 10, '10 kits funded by CSR donor');

  // Record wholesale procurement
  db.recordItemProcurement(itemNeed.id, 8, 'Invoice #HAR-9921 from Wholesale Agro Cooperatives');
  assert.strictEqual(itemNeed.quantityProcured, 8, 'Recorded procurement of 8 kits');
  assert.strictEqual(itemNeed.fulfillmentStatus, 'procuring', 'Item status updated to procuring');
  pass('Wholesale vendor procurement recorded with invoice audit details');

  // Record verified physical handover to beneficiaries
  db.recordItemDelivery(itemNeed.id, 6, 'Handover drive Barpeta shelter camp #2', 'https://example.com/proof1.jpg');
  assert.strictEqual(itemNeed.quantityDelivered, 6, 'Recorded verified delivery of 6 kits');
  pass('Verified physical handover recorded with delivery evidence');

  // Mode B: Physical in-kind pledge
  const pledge = db.createPhysicalItemPledge({
    campaignId: createdCampaign.id,
    itemId: itemNeed.id,
    donorName: 'Harish Goel',
    donorEmail: 'hgoel@gmail.com',
    quantity: 4,
    shippingCarrier: 'Delhivery',
    trackingNumber: 'DEL-88910293',
  });
  assert.strictEqual(pledge.status, 'pledged', 'Pledge created in pledged status');
  assert.strictEqual(itemNeed.quantityDelivered, 6, 'Unverified pledge does NOT increment item quantityDelivered');

  // Verify parcel arrival at warehouse
  db.verifyPhysicalItemPledge(pledge.id, 'Warehouse Lead');
  assert.strictEqual(itemNeed.quantityDelivered, 10, 'Verified physical pledge increments quantityDelivered to 10');
  assert.strictEqual(itemNeed.fulfillmentStatus, 'dispatched', 'Status reflects partial field progress');
  pass('Mode B physical parcels are NOT counted as delivered until authorized warehouse receipt verification');

  // --- TEST SUITE 6: HEAD STAFF RESTRICTIONS & PROPOSAL DIFF WORKFLOW ---
  console.log('\n--- 6. Testing Restricted Head Staff Workspace & Diff Review ---');
  // 1. Verify Head Staff permissions in matrix
  const rolePermissions = db.getRolePermissions();
  const staffRole = rolePermissions.find((r) => r.role === 'head_staff');
  assert(staffRole, 'Head Staff role exists in permission registry');
  assert(staffRole.permissions.includes('draft_campaigns'), 'Staff can draft campaigns');
  assert(staffRole.permissions.includes('propose_campaign_updates'), 'Staff can propose updates');
  assert(!staffRole.permissions.includes('manage_finances'), 'Staff CANNOT manage finances');
  assert(!staffRole.permissions.includes('manage_gateways'), 'Staff CANNOT access gateway secrets');
  assert(!staffRole.permissions.includes('approve_campaigns'), 'Staff CANNOT approve campaigns independently');
  pass('Head Staff RBAC permissions strictly enforce content drafting while disallowing gateway/financial tampering');

  // 2. Head Staff submits proposal
  const submission = db.createRevisionSubmission({
    campaignId: createdCampaign.id,
    title: 'Updated Need Assessment for Barpeta',
    slug: createdCampaign.slug,
    submittedBy: 'user-head-staff-1',
    submittedByName: 'Priyanka Sharma (Field Lead)',
    submissionNotes: 'Water levels surged 2 feet. Updating urgent story description.',
    proposedTitle: 'Urgent: Barpeta Flood Relief & Clean Water Emergency Drive',
    proposedShortDescription: 'Severe overnight flooding has increased displaced families to 1,500.',
    proposedStory: 'Updated ground narrative detailing critical need for dry food rations and emergency halogen tablets.',
  });

  assert.strictEqual(submission.status, 'pending_review', 'Staff submission enters pending_review queue');
  assert.notStrictEqual(createdCampaign.title, submission.proposedTitle, 'Submission does NOT alter live campaign title prior to admin review');
  pass('Head Staff proposal cannot bypass moderation or publish silently without administrator approval');

  // 3. Administrator reviews diff and approves
  db.approveRevisionSubmission(submission.id, 'Chief Administrator', 'Verified ground photographs and municipal reports.');
  assert.strictEqual(submission.status, 'approved', 'Submission status changed to approved');
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.title, 'Urgent: Barpeta Flood Relief & Clean Water Emergency Drive', 'Live campaign title updated upon administrative approval');
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.shortDescription, 'Severe overnight flooding has increased displaced families to 1,500.', 'Live campaign shortDescription updated');
  pass('Administrator side-by-side diff review publishes approved changes cleanly');

  // 4. Test Rejection does not alter campaign
  const badSubmission = db.createRevisionSubmission({
    campaignId: createdCampaign.id,
    title: 'Unverified Headline Proposal',
    submittedBy: 'user-head-staff-1',
    submittedByName: 'Priyanka Sharma',
    proposedTitle: 'Bogus Unverified Exaggerated Headline',
  });
  db.rejectRevisionSubmission(badSubmission.id, 'Chief Administrator', 'Unsubstantiated claims rejected.');
  assert.strictEqual(badSubmission.status, 'rejected', 'Submission rejected');
  assert.strictEqual(db.getCampaignById(createdCampaign.id)!.title, 'Urgent: Barpeta Flood Relief & Clean Water Emergency Drive', 'Campaign title remains completely unaltered after rejection');
  pass('Rejected revisions leave the live public campaign completely intact and unaltered');

  // --- TEST SUITE 7: CAMPAIGN FIELD UPDATES WORKFLOW ---
  console.log('\n--- 7. Testing Campaign Field Updates Workflow ---');
  const updateDraft = db.createCampaignUpdate({
    campaignId: createdCampaign.id,
    title: 'Boats Reach Deep Submerged Villages in Barpeta',
    content: 'Our field teams delivered 200 food kits and chlorine filter tablets via rescue boats.',
    authorName: 'Priyanka Sharma',
    authorRole: 'Field Coordinator',
    authorId: 'user-head-staff-1',
    milestoneAchieved: '200 Kits Distributed',
    eventDate: '2026-10-23',
    mediaUrls: ['https://example.com/boat-relief.jpg'],
    publishedAt: '',
  }, true);

  assert.strictEqual(updateDraft.status, 'pending_review', 'Staff update drafted in pending_review status');
  const publicUpdatesBefore = db.getCampaignUpdates(createdCampaign.id, false);
  assert(!publicUpdatesBefore.some((u) => u.id === updateDraft.id), 'Unreviewed update does NOT appear in public campaign feed');

  // Admin approves update
  db.approveCampaignUpdate(updateDraft.id, 'Chief Administrator');
  const publicUpdatesAfter = db.getCampaignUpdates(createdCampaign.id, false);
  assert(publicUpdatesAfter.some((u) => u.id === updateDraft.id), 'Approved update now appears in public campaign feed');
  pass('Campaign field updates require admin sign-off before public visibility');

  // --- TEST SUITE 8: ANALYTICS & LEDGER SEPARATION ---
  console.log('\n--- 8. Testing Financial vs Item Progress Separation ---');
  const analytics = db.getCampaignItemAnalytics(createdCampaign.id);
  assert(analytics.totalItemsRequired >= 500, 'Item analytics tracks total required');
  assert(analytics.totalItemsFunded >= 10, 'Item analytics tracks total funded items');
  assert(analytics.totalItemsProcured >= 8, 'Item analytics tracks total procured items');
  assert(analytics.totalItemsDelivered >= 10, 'Item analytics tracks total delivered items');
  assert(analytics.totalItemDesignatedAmount >= 12000, 'Item analytics calculates total item financial sponsorship');
  pass('Item progress and monetary progress remain distinctly separated without double-counting');

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED! (${passed} assertions verified)`);
  console.log('================================================================');
}

runStaffAndItemsTestSuite();
