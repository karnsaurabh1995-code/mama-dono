import { FAQItem } from '../types';

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'donor',
    question: 'How do I know my donation actually reaches the beneficiary?',
    answer: 'Every campaign on SevaSetu goes through rigorous multi-tier verification before going live. For medical campaigns, funds are disbursed directly to hospital patient welfare accounts or against verified pharmacy bills. For product giving, items are procured at wholesale and distributed with geotagged photo documentation. All campaign updates and fund utilization reports are published publicly on the campaign page.',
  },
  {
    id: 'faq-2',
    category: 'tax_80g',
    question: 'Is my donation eligible for Section 80G tax deduction?',
    answer: 'Yes! Donations made to campaigns marked with the "80G Tax Benefit" badge are eligible for up to 50% tax exemption under Section 80G of the Indian Income Tax Act. To claim this, provide your valid 10-digit PAN during checkout. An instant 80G acknowledgment receipt will be sent to your email and accessible in your donor account.',
  },
  {
    id: 'faq-3',
    category: 'payments',
    question: 'Which payment methods are accepted?',
    answer: 'We support all major Indian payment methods through our secure Razorpay gateway: UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking (over 50+ Indian banks), Debit and Credit Cards (Visa, Mastercard, RuPay), and popular digital wallets. International cards are supported for FCRA-registered non-profit campaigns.',
  },
  {
    id: 'faq-4',
    category: 'payments',
    question: 'Can I donate anonymously?',
    answer: 'Yes. On the checkout page, simply check the "Make my donation anonymous" box. Your name will be hidden from the public campaign supporters list and live donation feed. However, for legal tax and regulatory compliance, your contact and PAN details are securely retained in confidential audit records.',
  },
  {
    id: 'faq-5',
    category: 'fundraiser',
    question: 'How do I start a fundraiser for a medical emergency or social cause?',
    answer: 'Click on "Start a Campaign" in the navigation bar. Complete our simple 7-step wizard: select your cause, provide patient or beneficiary details, enter your target goal, and upload required verification documents (such as hospital estimate letters or NGO registration certificates). Our verification team reviews submissions within 4 to 24 hours.',
  },
  {
    id: 'faq-6',
    category: 'verification',
    question: 'How does SevaSetu verify non-profit organizations (NGOs)?',
    answer: 'Non-profits must submit their certificate of incorporation, valid 12A registration, 80G certificate from the Income Tax Department, PAN card, Darpan Portal ID, and FCRA registration (if receiving foreign funds). Our compliance team cross-verifies these credentials with official MCA and Income Tax databases before granting the "Verified Organization" badge.',
  },
  {
    id: 'faq-7',
    category: 'donor',
    question: 'How does Monthly Giving work and how can I cancel anytime?',
    answer: 'Monthly giving allows you to become a recurring mission supporter. Your chosen amount (e.g. ₹501/month) is automatically debited on your billing date via UPI Autopay or credit/debit card recurring mandates. You can pause, modify the amount, or cancel your subscription at any time directly from your Donor Account with zero penalties or hidden fees.',
  },
  {
    id: 'faq-8',
    category: 'payments',
    question: 'Are there any platform fees deducted from donations?',
    answer: 'SevaSetu operates on a 0% platform fee model for emergency individual medical fundraisers. We rely on optional voluntary tips provided by generous donors to keep our servers, verification team, and technology infrastructure running. Standard payment gateway processing fees (typically 1.8-2% + GST charged by Razorpay/banks) apply to transactions.',
  },
];
