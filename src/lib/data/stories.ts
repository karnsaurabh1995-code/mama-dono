import { ImpactStory } from '../types';

export const STORIES_DATA: ImpactStory[] = [
  {
    id: 'story-priya-hearing',
    slug: 'priya-hears-her-mothers-voice-first-time-cochlear-implant',
    title: "6-Year-Old Priya Hears Her Mother's Voice For the First Time",
    excerpt: 'Born with severe bilateral sensorineural hearing loss, Priya was facing a silent childhood until 540 generous donors funded her bilateral cochlear implant surgery at CMC Vellore.',
    content: `When 6-year-old Priya was turned on to sound in the audiometry lab at Christian Medical College (CMC) Vellore, tears rolled down her mother's face. For the first time since birth, Priya turned her head toward the sound of her mother calling her name.

Priya's father works as an agricultural laborer in rural Dharmapuri, earning less than ₹8,000 monthly. The cost of advanced multi-channel cochlear implants, surgery, and 2 years of auditory-verbal therapy was astronomical.

Through a verified community campaign on SevaSetu, 540 donors raised ₹13,20,000 in just 26 days. Today, Priya is enrolled in standard first grade, learning Tamil and English alongside her peers.`,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    author: 'Asha Jyoti Medical Social Work Team',
    category: 'medical',
    beneficiaryName: 'Priya & Family',
    impactMetrics: [
      { label: 'Amount Raised', value: '₹13,20,000' },
      { label: 'Total Donors', value: '540' },
      { label: 'Outcome', value: '100% Hearing Restored' },
    ],
    publishedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'story-village-solar-water',
    slug: 'clean-drinking-water-reaches-tribal-hamlet-sonbhadra',
    title: 'How Clean Solar Water Reached 350 Tribal Families in Sonbhadra',
    excerpt: 'Women in tribal Sonbhadra used to trek 6 kilometers every morning to fetch muddy stream water. A community solar-powered deep borehole now provides 12,000 liters of safe drinking water daily.',
    content: `For generations, the residents of village Belhathi in Sonbhadra, Uttar Pradesh, suffered from severe fluorosis and gastrointestinal diseases caused by contaminated surface water. Young girls spent up to four hours daily balancing brass water vessels over steep rocky terrain instead of attending school.

With ₹7,50,000 raised through 310 micro-donors and corporate CSR matching on our platform, our partner engineers drilled a 400-foot deep tube well powered by a 5HP solar submersible pump with an automated fluoride filtration column.

Today, eight community taps deliver safe, sweet drinking water right to the village square, and female school attendance in Belhathi has jumped by 72%.`,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    author: 'Samarthya Grassroots Mission',
    category: 'environment',
    beneficiaryName: '350 Tribal Households',
    impactMetrics: [
      { label: 'Daily Clean Water', value: '12,000 Liters' },
      { label: 'Girls in School', value: '+72% Attendance' },
      { label: 'Waterborne Illness', value: 'Reduced by 94%' },
    ],
    publishedAt: '2026-08-30T14:30:00Z',
  },
  {
    id: 'story-rescued-pup-sheru',
    slug: 'sherus-journey-from-paralyzed-hit-and-run-to-walking-again',
    title: "Sheru's Miracle: From a Paralyzed Hit-and-Run Victim to Running in Bengaluru",
    excerpt: 'Found abandoned on Outer Ring Road with shattered lumbar vertebrae, Sheru received orthopedic spine decompression and custom wheels from Karuna Pashu Kalyan.',
    content: `Sheru was hit by a speeding truck on Outer Ring Road and left helpless by the side of the road for over 18 hours until a passerby alerted the Karuna 24/7 rescue helpline.

Initial X-rays revealed severe spinal compression. With the assistance of 180 animal lovers who contributed ₹1,85,000 for neurosurgery, daily acupuncture, and hydrotherapy, Sheru has regained full reflex control and now walks joyfully at the Karuna sanctuary.`,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80',
    author: 'Karuna Veterinary Rescue Team',
    category: 'animals',
    beneficiaryName: 'Sheru (Community Dog)',
    impactMetrics: [
      { label: 'Surgery & Rehab', value: '45 Days' },
      { label: 'Loving Donors', value: '180' },
      { label: 'Status', value: 'Fully Mobile & Adopted' },
    ],
    publishedAt: '2026-07-25T11:00:00Z',
  },
];
