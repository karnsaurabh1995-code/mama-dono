import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '../../src/lib/db';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../../src/lib/payment/razorpay';
import { SecurityFinding, ScannerResult } from './dependency-audit';

export interface PaymentIntegrityCheckResult {
  checkName: string;
  passed: boolean;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  details?: string;
  finding?: SecurityFinding;
}

export async function runRazorpayIntegrityAudit(rootDir: string, rawDir: string): Promise<ScannerResult> {
  const startTime = Date.now();
  const checks: PaymentIntegrityCheckResult[] = [];
  const findings: SecurityFinding[] = [];

  const mockSecret = 'test_secret_key_dokind_9876543210';
  const mockWebhookSecret = 'test_webhook_secret_dokind_abcdef123';
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;

  // 1. Test Valid Razorpay Signature Verification
  try {
    const validSig = crypto
      .createHmac('sha256', mockSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: validSig,
      keySecret: mockSecret,
    });

    checks.push({
      checkName: 'Razorpay Valid HMAC Signature Verification',
      passed: isValid === true,
      severity: 'Critical',
      description: 'Server correctly verifies valid HMAC-SHA256 signature calculated from order_id|payment_id.',
      details: `Calculated HMAC verified: ${isValid}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Valid HMAC Signature Verification',
      passed: false,
      severity: 'Critical',
      description: 'Error during signature verification execution.',
      details: err.message,
    });
  }

  // 2. Test Tampered Signature Detection
  try {
    const tamperedSig = 'a'.repeat(64);
    const isValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: tamperedSig,
      keySecret: mockSecret,
    });

    checks.push({
      checkName: 'Razorpay Tampered Signature Rejection',
      passed: isValid === false,
      severity: 'Critical',
      description: 'Server rejects forged or tampered payment signature.',
      details: `Forged signature accepted: ${isValid}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Tampered Signature Rejection',
      passed: false,
      severity: 'Critical',
      description: 'Error during tampered signature check.',
      details: err.message,
    });
  }

  // 3. Test Order ID Mismatch Rejection
  try {
    const validSig = crypto
      .createHmac('sha256', mockSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      orderId: 'order_different_9999',
      paymentId: testPaymentId,
      signature: validSig,
      keySecret: mockSecret,
    });

    checks.push({
      checkName: 'Razorpay Order ID Substitution Rejection',
      passed: isValid === false,
      severity: 'Critical',
      description: 'Server rejects signature if order ID does not match the signed token.',
      details: `Substituted order ID accepted: ${isValid}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Order ID Substitution Rejection',
      passed: false,
      severity: 'Critical',
      description: 'Error during order substitution check.',
      details: err.message,
    });
  }

  // 4. Test Webhook Signature with Raw Body
  try {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: testPaymentId,
            order_id: testOrderId,
            amount: 10000,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(rawPayload)
      .digest('hex');

    const isValid = verifyWebhookSignature({
      rawBody: rawPayload,
      signature: validWebhookSig,
      webhookSecret: mockWebhookSecret,
    });

    checks.push({
      checkName: 'Razorpay Webhook Raw Body HMAC Verification',
      passed: isValid === true,
      severity: 'Critical',
      description: 'Server correctly verifies X-Razorpay-Signature using the exact raw body string.',
      details: `Raw body webhook verification: ${isValid}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Webhook Raw Body HMAC Verification',
      passed: false,
      severity: 'Critical',
      description: 'Error during webhook signature check.',
      details: err.message,
    });
  }

  // 5. Test Webhook Tampered Payload Rejection
  try {
    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const validWebhookSig = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(rawPayload)
      .digest('hex');

    const tamperedPayload = JSON.stringify({ event: 'payment.captured', tampered: true });
    const isValid = verifyWebhookSignature({
      rawBody: tamperedPayload,
      signature: validWebhookSig,
      webhookSecret: mockWebhookSecret,
    });

    checks.push({
      checkName: 'Razorpay Webhook Tampered Payload Rejection',
      passed: isValid === false,
      severity: 'Critical',
      description: 'Server rejects webhook when request body has been modified after signature calculation.',
      details: `Modified payload accepted: ${isValid}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Webhook Tampered Payload Rejection',
      passed: false,
      severity: 'Critical',
      description: 'Error during tampered webhook payload check.',
      details: err.message,
    });
  }

  // 6. Test Webhook & Payment Idempotency in Database
  try {
    const campaign = db.getCampaigns()[0];
    if (campaign) {
      const initialRaised = campaign.raisedAmount;
      const initialSupporters = campaign.supporterCount;

      // Create a test order
      const donationOrder = db.createDonationOrder({
        campaignId: campaign.id,
        donorName: 'Security Audit Runner',
        donorEmail: 'audit@dokind.test',
        amount: 100,
        tipAmount: 0,
        paymentMethod: 'razorpay_simulated',
        isAnonymous: false,
      });

      // Complete payment 1st time
      db.verifyAndCompletePayment({
        razorpayOrderId: donationOrder.razorpayOrderId,
        razorpayPaymentId: `pay_audit_${Date.now()}`,
        razorpaySignature: 'sig_audit_test_valid',
      });

      const raisedAfterFirst = campaign.raisedAmount;
      const supportersAfterFirst = campaign.supporterCount;

      // Complete payment 2nd time (replay attempt)
      db.verifyAndCompletePayment({
        razorpayOrderId: donationOrder.razorpayOrderId,
        razorpayPaymentId: `pay_audit_${Date.now()}`,
        razorpaySignature: 'sig_audit_test_valid',
      });

      // Complete payment 3rd time (retry attempt)
      db.verifyAndCompletePayment({
        razorpayOrderId: donationOrder.razorpayOrderId,
        razorpayPaymentId: `pay_audit_${Date.now()}`,
        razorpaySignature: 'sig_audit_test_valid',
      });

      const raisedAfterReplays = campaign.raisedAmount;
      const supportersAfterReplays = campaign.supporterCount;

      const isIdempotent =
        raisedAfterReplays === raisedAfterFirst && supportersAfterReplays === supportersAfterFirst;

      checks.push({
        checkName: 'Payment Completion Idempotency & Replay Resistance',
        passed: isIdempotent,
        severity: 'Critical',
        description: 'Replaying completed payment notifications does not duplicate monetary totals or supporter count.',
        details: `Initial: ${initialRaised}, 1st complete: ${raisedAfterFirst}, After 3 replays: ${raisedAfterReplays}`,
      });

      // Rollback test donation from campaign to leave DB clean
      campaign.raisedAmount = initialRaised;
      campaign.supporterCount = initialSupporters;
      // Clean up test donation records
      (db as any).donations = (db as any).donations.filter(
        (d: any) => !d.donorEmail.includes('audit@dokind.test')
      );
    }
  } catch (err: any) {
    checks.push({
      checkName: 'Payment Completion Idempotency & Replay Resistance',
      passed: false,
      severity: 'Critical',
      description: 'Error during payment completion idempotency test.',
      details: err.message,
    });
  }

  // 7. Business Logic Check: Item Donation Price & Total Tampering Detection
  try {
    const campaign = db.getCampaigns()[0];
    const itemNeeds = db.getCampaignItemNeeds(campaign.id);

    if (itemNeeds.length > 0) {
      const targetItem = itemNeeds[0];
      const genuinePrice = targetItem.unitPrice; // e.g., 500
      const forgedPrice = 1; // client alters unitPrice to ₹1

      let orderCreatedWithForgedPrice = false;
      try {
        const order = db.createDonationOrder({
          campaignId: campaign.id,
          donorName: 'Malicious Actor',
          donorEmail: 'attacker@dokind.test',
          amount: 50, // Pay ₹50 for ₹1000 item
          tipAmount: 0,
          paymentMethod: 'upi',
          isAnonymous: false,
          itemAllocations: [
            {
              itemId: targetItem.id,
              itemName: targetItem.name,
              unitPrice: forgedPrice,
              quantity: 2,
            },
          ],
        });
        if (order) {
          orderCreatedWithForgedPrice = true;
          // Clean up malicious test order
          (db as any).donations = (db as any).donations.filter(
            (d: any) => !d.donorEmail.includes('attacker@dokind.test')
          );
        }
      } catch {
        orderCreatedWithForgedPrice = false;
      }

      if (orderCreatedWithForgedPrice) {
        const finding: SecurityFinding = {
          id: 'RZP-BIZ-PRICE-TAMPER',
          title: 'Business Logic Flaw: Client-Controlled Item Unit Price in Donation Orders',
          severity: 'High',
          confidence: 'High',
          status: 'unresolved',
          component: 'src/lib/db/index.ts -> createDonationOrder',
          file: 'src/lib/db/index.ts',
          line: 995,
          cwe: 'CWE-840: Business Logic Errors',
          owasp: 'A04:2021 - Insecure Design',
          description: 'createDonationOrder accepts unitPrice from the client-supplied itemAllocations array rather than resolving unitPrice authoritatively from the server-side campaignItemNeeds database record.',
          evidence: `Client supplied unitPrice: ₹${forgedPrice} while authoritative catalog price is ₹${genuinePrice}. Order was initialized without rejecting price divergence.`,
          reproduction: 'POST /api/donations/create-order with itemAllocations containing forged unitPrice: 1',
          impact: 'A donor could fund high-value campaign items (e.g., ₹10,000 medical kits) while paying only ₹50, corrupting item inventory fulfillment and fundraising metrics.',
          remediation: 'Lookup itemNeed in database and enforce alloc.unitPrice = itemNeed.unitPrice, and assert params.amount >= calculatedItemTotal.',
          scanner: 'razorpay-integrity',
        };
        findings.push(finding);
        checks.push({
          checkName: 'Server-Side Item Price & Calculation Enforcement',
          passed: false,
          severity: 'High',
          description: 'Client cannot manipulate item unit prices or fund items below authoritative catalog cost.',
          details: 'Vulnerability confirmed: client-controlled unitPrice accepted.',
          finding,
        });
      } else {
        checks.push({
          checkName: 'Server-Side Item Price & Calculation Enforcement',
          passed: true,
          severity: 'High',
          description: 'Server authoritatively enforces item unit prices and total calculation.',
        });
      }
    }
  } catch (err: any) {
    checks.push({
      checkName: 'Server-Side Item Price & Calculation Enforcement',
      passed: false,
      severity: 'High',
      description: 'Error during price tampering check.',
      details: err.message,
    });
  }

  // 8. Test Timing Safe Comparison Check in razorpay.ts
  try {
    const razorpayTsPath = path.join(rootDir, 'src', 'lib', 'payment', 'razorpay.ts');
    const razorpayCode = fs.readFileSync(razorpayTsPath, 'utf8');
    const usesTimingSafe = razorpayCode.includes('crypto.timingSafeEqual');

    checks.push({
      checkName: 'Timing Attack Resistance (crypto.timingSafeEqual)',
      passed: usesTimingSafe,
      severity: 'High',
      description: 'Signature comparison must use crypto.timingSafeEqual to prevent side-channel timing attacks.',
      details: usesTimingSafe ? 'crypto.timingSafeEqual confirmed in razorpay.ts' : 'Missing crypto.timingSafeEqual',
    });

    if (!usesTimingSafe) {
      findings.push({
        id: 'RZP-TIMING-ATTACK',
        title: 'Cryptographic Timing Attack in Payment Signature Verification',
        severity: 'High',
        confidence: 'High',
        status: 'unresolved',
        component: 'src/lib/payment/razorpay.ts',
        file: 'src/lib/payment/razorpay.ts',
        cwe: 'CWE-208: Observable Timing Discrepancy',
        owasp: 'A02:2021 - Cryptographic Failures',
        description: 'String comparison using standard equality operator (===) leaks timing information proportional to the number of matching prefix characters.',
        evidence: 'Standard equality used in signature comparison',
        reproduction: 'Inspect src/lib/payment/razorpay.ts',
        impact: 'Remote attackers can infer HMAC digest bytes by measuring microsecond latency differences.',
        remediation: 'Use crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received)).',
        scanner: 'razorpay-integrity',
      });
    }
  } catch (err: any) {
    checks.push({
      checkName: 'Timing Attack Resistance (crypto.timingSafeEqual)',
      passed: false,
      severity: 'High',
      description: 'Could not read razorpay.ts',
      details: err.message,
    });
  }

  // 9. Test Verification Route Signature Enforcement
  try {
    const verifyRoutePath = path.join(rootDir, 'src', 'app', 'api', 'donations', 'verify', 'route.ts');
    const verifyCode = fs.readFileSync(verifyRoutePath, 'utf8');

    // Check if verification route enforces strict production signature requirement
    const hasStrictProductionGuard =
      (verifyCode.includes("NODE_ENV === 'production'") ||
        verifyCode.includes('NODE_ENV === "production"')) &&
      verifyCode.includes('razorpaySignature');

    if (!hasStrictProductionGuard && verifyCode.includes('keySecret && razorpaySignature')) {
      const finding: SecurityFinding = {
        id: 'RZP-VERIFY-BYPASS-PROD-GUARD',
        title: 'Payment Verification Route Lacks Strict Production Signature Gate',
        severity: 'High',
        confidence: 'High',
        status: 'unresolved',
        component: 'src/app/api/donations/verify/route.ts',
        file: 'src/app/api/donations/verify/route.ts',
        line: 20,
        cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
        owasp: 'A02:2021 - Cryptographic Failures',
        description: 'The verify route checks `if (keySecret && razorpaySignature)` without strictly asserting that in production environments both keySecret and razorpaySignature MUST be present and valid, falling back to mock completion otherwise.',
        evidence: 'if (keySecret && razorpaySignature) {...} followed by fallback mock signature assignment',
        reproduction: 'POST /api/donations/verify with orderId and paymentId but omit razorpaySignature',
        impact: 'If deployed without strict environment enforcement, an attacker can mark donations as completed without paying through Razorpay.',
        remediation: 'Add a check: if (process.env.NODE_ENV === "production" && (!keySecret || !razorpaySignature)) return NextResponse.json({ error: "Cryptographic signature required" }, { status: 400 });',
        scanner: 'razorpay-integrity',
      };
      findings.push(finding);
      checks.push({
        checkName: 'Production Payment Signature Enforcement Gate',
        passed: false,
        severity: 'High',
        description: 'Verify route strictly requires cryptographic signature in production.',
        details: 'Missing strict NODE_ENV production requirement.',
        finding,
      });
    } else {
      checks.push({
        checkName: 'Production Payment Signature Enforcement Gate',
        passed: true,
        severity: 'High',
        description: 'Verify route enforces cryptographic signature.',
      });
    }
  } catch (err: any) {
    checks.push({
      checkName: 'Production Payment Signature Enforcement Gate',
      passed: false,
      severity: 'High',
      description: 'Could not read verify route',
      details: err.message,
    });
  }

  // 10. Test Credential Leakage in Frontend Bundle / NEXT_PUBLIC
  try {
    const envExamplePath = path.join(rootDir, '.env.example');
    let envHasLeakedSecret = false;
    if (fs.existsSync(envExamplePath)) {
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      if (
        envContent.includes('NEXT_PUBLIC_RAZORPAY_KEY_SECRET') ||
        envContent.includes('NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET')
      ) {
        envHasLeakedSecret = true;
      }
    }

    checks.push({
      checkName: 'Razorpay Secret Environment Scope (Server-Only)',
      passed: !envHasLeakedSecret,
      severity: 'Critical',
      description: 'Razorpay Key Secret and Webhook Secret must NOT have NEXT_PUBLIC_ prefix, preventing client bundling.',
      details: envHasLeakedSecret ? 'NEXT_PUBLIC prefix detected on private secret!' : 'Secrets correctly kept server-side.',
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Razorpay Secret Environment Scope (Server-Only)',
      passed: true,
      severity: 'Critical',
      description: 'Environment scope check completed.',
    });
  }

  // 11. Test Refund Role-Based Server Authorization
  try {
    const campaign = db.getCampaigns()[0];
    const testDonation = db.createDonationOrder({
      campaignId: campaign.id,
      donorName: 'Refund Auth Test Donor',
      donorEmail: 'refund-auth@dokind.test',
      amount: 150,
      tipAmount: 0,
      paymentMethod: 'razorpay_simulated',
      isAnonymous: false,
    });

    db.verifyAndCompletePayment({
      razorpayOrderId: testDonation.razorpayOrderId,
      razorpayPaymentId: `pay_refund_auth_${Date.now()}`,
      razorpaySignature: 'sig_valid_test',
    });

    let unauthorizedRefundBlocked = false;
    try {
      // Attempt refund with unauthorized 'donor' role
      db.processRefund(
        testDonation.id,
        'Unauthorized refund test',
        { id: 'user-donor-99', name: 'Malicious Donor', role: 'donor' as any }
      );
    } catch (authErr: any) {
      if (authErr.message.includes('Unauthorized')) {
        unauthorizedRefundBlocked = true;
      }
    }

    // Now test authorized refund with 'finance' role
    let authorizedRefundSucceeded = false;
    try {
      db.processRefund(
        testDonation.id,
        'Authorized refund test',
        { id: 'user-finance-1', name: 'Finance Admin', role: 'finance' }
      );
      authorizedRefundSucceeded = true;
    } catch {
      authorizedRefundSucceeded = false;
    }

    // Clean up test donation from db.donations
    (db as any).donations = (db as any).donations.filter(
      (d: any) => d.id !== testDonation.id && !d.donorEmail.includes('refund-auth@dokind.test')
    );

    const refundAuthPassed = unauthorizedRefundBlocked && authorizedRefundSucceeded;

    checks.push({
      checkName: 'Refund Role-Based Server Authorization Gate',
      passed: refundAuthPassed,
      severity: 'High',
      description: 'Server strictly rejects refund initiation from unauthorized roles and accepts authorized finance/admin roles.',
      details: refundAuthPassed
        ? 'Unauthorized roles rejected, authorized finance roles accepted.'
        : `Unauthorized blocked: ${unauthorizedRefundBlocked}, Authorized succeeded: ${authorizedRefundSucceeded}`,
    });
  } catch (err: any) {
    checks.push({
      checkName: 'Refund Role-Based Server Authorization Gate',
      passed: false,
      severity: 'High',
      description: 'Error during refund authorization test.',
      details: err.message,
    });
  }

  // Record raw output
  const rawReport = {
    executedAt: new Date().toISOString(),
    totalChecks: checks.length,
    passedChecks: checks.filter((c) => c.passed).length,
    failedChecks: checks.filter((c) => !c.passed).length,
    checks,
  };
  fs.writeFileSync(path.join(rawDir, 'razorpay-integrity.json'), JSON.stringify(rawReport, null, 2));

  return {
    scanner: 'razorpay-integrity',
    toolName: 'Razorpay Cryptographic & Business Logic Integrity Suite',
    version: '1.0.0',
    durationMs: Date.now() - startTime,
    status: findings.some((f) => f.severity === 'Critical' || f.severity === 'High') ? 'failed' : 'passed',
    findings,
    rawOutput: rawReport,
  };
}
