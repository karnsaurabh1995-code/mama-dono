import { Campaign } from '../types';

export const CAMPAIGNS_DATA: Campaign[] = [
  {
    id: 'camp-aarav-cancer',
    slug: 'save-4-year-old-aarav-leukemia-treatment',
    title: 'Urgent: Help 4-Year-Old Aarav Fight Acute Lymphoblastic Leukemia',
    shortDescription: 'Little Aarav was diagnosed with high-risk blood cancer. His father, a rickshaw driver, has exhausted all savings. Chemo and bone marrow transplant at AIIMS New Delhi are urgently required.',
    story: `Aarav was just learning his alphabets when recurrent high fevers and sudden bruising shook his family. Diagnostic tests at AIIMS New Delhi confirmed B-cell Acute Lymphoblastic Leukemia.

Doctors have advised 6 cycles of intensive induction chemotherapy followed by allogeneic bone marrow transplantation. The total medical estimate, including hospital bed charges, chemotherapy drugs, anti-fungal infusions, and transplant unit costs, stands at ₹14,50,000.

His father, Ramesh Kumar, earns ₹9,000 a month driving an e-rickshaw in East Delhi. He has already borrowed from relatives and sold his wife's jewelry to fund the initial hospitalization. Without community financial intervention, Aarav's treatment risks discontinuation.

Every rupee donated directly relieves hospital pharmacy bills and clinical procedures at AIIMS. Your donation is eligible for 50% tax deduction under Section 80G.`,
    category: 'medical',
    campaignType: 'one-time',
    goalAmount: 1450000,
    raisedAmount: 1042500,
    supporterCount: 684,
    deadline: '2026-11-20',
    featured: true,
    urgent: true,
    staffPick: true,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    ],
    beneficiaryName: 'Master Aarav Kumar',
    beneficiaryLocation: 'AIIMS, New Delhi',
    hospitalName: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
    organizerName: 'Asha Jyoti Foundation',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    organizationId: 'org-hope-india',
    organizationName: 'Asha Jyoti Foundation',
    itemizedBudget: [
      { id: 'b1', item: 'Induction & Consolidation Chemotherapy', amount: 480000, description: '6 cycles of protocol chemotherapy drugs' },
      { id: 'b2', item: 'Bone Marrow Transplant Unit & Isolation Bed', amount: 550000, description: 'Clean room ICU and transplant fees' },
      { id: 'b3', item: 'Supportive Antibiotics & Platelet Transfusions', amount: 260000, description: 'Daily blood component therapy & anti-virals' },
      { id: 'b4', item: 'Post-transplant Immunosuppressant Monitoring', amount: 160000, description: '6-month diagnostic laboratory workup' },
    ],
    useOfFunds: 'Direct disbursement to AIIMS Hospital Patient Welfare Account and verified medical dispensary bills.',
    documents: [
      { id: 'd1', title: 'AIIMS Medical Certificate & Treatment Estimate', type: 'medical_estimate', url: '#', verified: true },
      { id: 'd2', title: 'Parent Government Identity & BPL Card', type: 'id_proof', url: '#', verified: true },
      { id: 'd3', title: 'Treating Oncologist Letter of Urgency', type: 'medical_estimate', url: '#', verified: true },
    ],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-10-22T14:30:00Z',
  },
  {
    id: 'camp-girl-education-rural',
    slug: 'sponsor-schooling-digital-labs-500-rural-girls',
    title: 'Sponsor Schooling & STEM Digital Learning for 500 Rural Girls',
    shortDescription: 'Break the cycle of child marriage and poverty. Provide uniforms, STEM kits, digital tablets, and certified bridge mentorship across 20 villages in Varanasi district.',
    story: `In many rural clusters across eastern Uttar Pradesh, over 48% of young girls drop out of formal schooling between grades 6 and 9 due to safety concerns, lack of school supplies, and household economic pressure.

Vani Vidya Sansthan runs community-led evening learning hubs that work alongside government elementary schools. By providing students with school uniforms, durable backpacks, textbook sets, and supervised computer tablets with regional science curricula, we have maintained a 98% retention rate over the past four academic years.

This fundraiser supports 500 girls across 20 agrarian villages for the full 2026-2027 academic year. Each scholarship of ₹4,000 covers school supplies, remedial tutoring, a digital tablet share, and parent counseling sessions.

Invest in a girl child's future today. All contributions are 100% transparent and eligible for Section 80G tax certificates.`,
    category: 'education',
    campaignType: 'one-time',
    goalAmount: 2000000,
    raisedAmount: 1460000,
    supporterCount: 412,
    deadline: '2026-12-15',
    featured: true,
    urgent: false,
    staffPick: true,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    ],
    beneficiaryName: '500 Girl Students',
    beneficiaryLocation: 'Sewapuri Block, Varanasi, UP',
    organizerName: 'Vani Vidya Sansthan',
    organizerRole: 'organization',
    organizerId: 'org-vidya-setu',
    organizationId: 'org-vidya-setu',
    organizationName: 'Vani Vidya Sansthan',
    itemizedBudget: [
      { id: 'b1', item: '500 Annual Learning Kits (Books, Uniforms, Bag)', amount: 850000, description: '₹1,700 per student kit' },
      { id: 'b2', item: '40 Shared Rugged STEM Tablets with Hindi Content', amount: 520000, description: 'For village remedial cluster labs' },
      { id: 'b3', item: 'Honorarium for 20 Village Remedial Mentors', amount: 480000, description: '₹2,000/month per teacher for 12 months' },
      { id: 'b4', item: 'Annual Health & Menstrual Hygiene Packs', amount: 150000, description: 'Safe pads and wellness kits' },
    ],
    useOfFunds: 'Procurement of educational materials, learning tablets, and teacher stipends under verified audit.',
    documents: [
      { id: 'd1', title: 'NGO Registration 12A & 80G Certified Copies', type: 'tax_cert', url: '#', verified: true },
      { id: 'd2', title: 'Village Panchayat Permission Letters', type: 'other', url: '#', verified: true },
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-10-21T11:15:00Z',
  },
  {
    id: 'camp-hunger-mumbai-hospital',
    slug: 'serve-daily-hot-meals-hospital-attendants-mumbai',
    title: 'Serve 1,000 Daily Nutritious Meals to Impoverished Hospital Attendants',
    shortDescription: 'Family members of critical patients travel from distant villages to Mumbai public hospitals and often sleep on footpaths without food. Help Annapurna Seva serve wholesome meals daily.',
    story: `Outside KEM Hospital and Tata Memorial Hospital in Mumbai, thousands of poor families wait on pavements while their loved ones battle cancer, liver failure, and cardiac illnesses inside.

Having spent every penny on tests and travel tickets, attendants frequently starve themselves to save money for medicines. A hungry attendant cannot effectively support a healing patient.

Annapurna Seva Trust runs an automated central kitchen in Lower Parel that cooks wholesome, fresh khichdi, dal, rotis, and vegetable curry. We pack and distribute these meals daily with strict hygiene and zero food waste.

At just ₹35 per hot, calorie-dense meal, your contribution directly feeds someone enduring the hardest trial of their life.`,
    category: 'food-hunger',
    campaignType: 'monthly',
    goalAmount: 1050000,
    raisedAmount: 892500,
    supporterCount: 1120,
    deadline: '2026-11-30',
    featured: true,
    urgent: true,
    staffPick: false,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    ],
    beneficiaryName: 'Hospital Patient Caregivers',
    beneficiaryLocation: 'Parel & Sion Hospitals, Mumbai',
    organizerName: 'Annapurna Seva Trust',
    organizerRole: 'organization',
    organizerId: 'org-akshaya-patra-mitra',
    organizationId: 'org-akshaya-patra-mitra',
    organizationName: 'Annapurna Seva Trust',
    itemizedBudget: [
      { id: 'b1', item: 'Bulk Grains, Pulses, Mustard Oil & Spices', amount: 620000, description: 'Procured from agricultural mandis for 30,000 meals' },
      { id: 'b2', item: 'Fresh Daily Green Vegetables', amount: 210000, description: 'Potatoes, spinach, gourds, carrots' },
      { id: 'b3', item: 'Biodegradable Meal Packaging & Logistics', amount: 120000, description: 'Eco-friendly containers and delivery van fuel' },
      { id: 'b4', item: 'Kitchen Helpers & Cleanliness Sanitation', amount: 100000, description: 'Sanitary kitchen staff wages' },
    ],
    useOfFunds: 'Direct food ration procurement and food truck operations across Mumbai government hospitals.',
    documents: [
      { id: 'd1', title: 'Food Safety and Standards Authority of India (FSSAI) License', type: 'other', url: '#', verified: true },
      { id: 'd2', title: '80G Tax Exemption Certificate', type: 'tax_cert', url: '#', verified: true },
    ],
    createdAt: '2026-07-10T12:00:00Z',
    updatedAt: '2026-10-23T09:40:00Z',
  },
  {
    id: 'camp-prosthetic-mobility-aid',
    slug: 'gift-mobility-prosthetic-limbs-150-amputees',
    title: 'Gift High-Mobility Modular Prosthetic Limbs to 150 Amputees',
    shortDescription: 'Empower laborers and youth who lost limbs in farming accidents or train incidents to stand, walk, and earn a dignified livelihood again.',
    story: `Losing a leg or arm in rural India often condemns a breadwinner to absolute helplessness, social isolation, and extreme poverty.

Samarthya Disability Aid Trust designs and fits custom lightweight modular prosthetics that allow recipients to walk on uneven terrain, cycle, and resume independent agricultural or workshop employment.

Each prosthesis is custom-measured by certified prosthetists, fitted, and backed by gait rehabilitation training. The total cost of custom fabrication, durable carbon-composite components, and 2-week physiotherapy rehabilitation is ₹15,000 per beneficiary.

With your help, 150 individuals across rural Gujarat and Rajasthan will walk independently again.`,
    category: 'disability',
    campaignType: 'product',
    goalAmount: 2250000,
    raisedAmount: 1875000,
    supporterCount: 388,
    deadline: '2026-12-31',
    featured: true,
    urgent: false,
    staffPick: true,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [],
    beneficiaryName: '150 Rural Amputees',
    beneficiaryLocation: 'Ahmedabad & Saurashtra, Gujarat',
    organizerName: 'Samarthya Disability Aid Trust',
    organizerRole: 'organization',
    organizerId: 'org-samarthya-trust',
    organizationId: 'org-samarthya-trust',
    organizationName: 'Samarthya Disability Aid Trust',
    itemizedBudget: [
      { id: 'b1', item: '150 Custom Composite Sockets & Pylons', amount: 1350000, description: '₹9,000 per mechanical limb assembly' },
      { id: 'b2', item: '150 Multi-axis Dynamic Foot / Knee Units', amount: 525000, description: '₹3,500 per articulated joint unit' },
      { id: 'b3', item: 'Rehabilitation Camp, Boarding & Gait Training', amount: 375000, description: 'Clinical physiotherapy and fitting camp' },
    ],
    useOfFunds: 'Raw materials, component machining, clinical fitting, and rehabilitation therapy.',
    documents: [
      { id: 'd1', title: 'Rehabilitation Council of India (RCI) Certification', type: 'other', url: '#', verified: true },
      { id: 'd2', title: 'Beneficiary Case Assessment Records', type: 'medical_estimate', url: '#', verified: true },
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-10-22T16:00:00Z',
  },
  {
    id: 'camp-karuna-stray-rescue',
    slug: 'emergency-medical-care-trauma-shelter-stray-animals',
    title: 'Emergency Medical Care & Trauma Sanctuary for 250 Stray Animals',
    shortDescription: 'Hit-and-run dog victims, abandoned cattle, and injured birds need round-the-clock intensive veterinary care, surgeries, and peaceful recovery.',
    story: `Bengaluru's streets are home to hundreds of thousands of community animals who face vehicular collisions, chemical burns, and severe infectious diseases every single day.

Karuna Pashu Kalyan Kendra operates two critical animal ambulances and a trauma treatment hospital in North Bengaluru. Our veterinary surgical team treats spinal injuries, fractures, maggot wounds, and canine distemper cases regardless of whether the animal has an owner.

We are currently caring for 250 hospitalized animals who require daily medication, sterile dressings, veterinary saline, and special nutritional recovery diets.

Your gift provides medicines, surgical consumables, and cozy bedding for injured animals who have nobody else to turn to.`,
    category: 'animals',
    campaignType: 'monthly',
    goalAmount: 900000,
    raisedAmount: 710000,
    supporterCount: 520,
    deadline: '2026-11-25',
    featured: false,
    urgent: true,
    staffPick: false,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [],
    beneficiaryName: '250 Rescued Stray Animals',
    beneficiaryLocation: 'Yelahanka, Bengaluru',
    organizerName: 'Karuna Pashu Kalyan Kendra',
    organizerRole: 'organization',
    organizerId: 'org-karuna-animal',
    organizationId: 'org-karuna-animal',
    organizationName: 'Karuna Pashu Kalyan Kendra',
    itemizedBudget: [
      { id: 'b1', item: 'Veterinary Medicines, Antibiotics & Painkillers', amount: 380000, description: 'Medical dispensary supplies for 3 months' },
      { id: 'b2', item: 'Surgical Consumables & Orthopedic Pinning', amount: 220000, description: 'Fracture repairs and wound management' },
      { id: 'b3', item: 'Recovery Food, Rice, Broth & Dry Feed', amount: 180000, description: 'Nutritious meals for 250 animals' },
      { id: 'b4', item: 'Animal Ambulance Fuel & Driver Night Shift', amount: 120000, description: '24/7 rescue transport' },
    ],
    useOfFunds: 'Veterinary pharmacy supplies, medical procedures, ambulance operation, and sanctuary feed.',
    documents: [
      { id: 'd1', title: 'Animal Welfare Board of India (AWBI) Recognition', type: 'other', url: '#', verified: true },
      { id: 'd2', title: 'Veterinary Hospital Registration Certificate', type: 'other', url: '#', verified: true },
    ],
    createdAt: '2026-09-01T14:00:00Z',
    updatedAt: '2026-10-23T08:30:00Z',
  },
  {
    id: 'camp-assam-flood-relief',
    slug: 'emergency-flood-ration-clean-water-kits-assam',
    title: 'Flood Relief 2026: Deliver 2,000 Emergency Food & Water Purification Kits in Assam',
    shortDescription: 'Severe monsoon floods have inundated over 80 villages along the Brahmaputra basin. Displaced families urgently need ready-to-eat rations, baby food, and water purifying tablets.',
    story: `Torrential rainfall across the northeastern Himalayan foothills has triggered sudden flash floods and riverbank breaches across Darrang and Morigaon districts of Assam.

Over 45,000 people have been forced onto elevated embankments and highway dividers with only the clothes on their backs. Local drinking water tube wells have submerged, leading to an immediate outbreak of waterborne diarrheal illnesses.

Our relief brigade has mobilized local boats to deliver waterproof relief kits containing:
- 10 kg flattened rice (chira), gur, roasted gram, and biscuits
- 100 chlorine water purification tablets
- Oral Rehydration Salts (ORS) packets and basic fever medication
- Mosquito nets and waterproof tarpaulin sheets

Every ₹1,200 delivers a full disaster survival kit to a stranded family of five.`,
    category: 'disaster-relief',
    campaignType: 'product',
    goalAmount: 2400000,
    raisedAmount: 1890000,
    supporterCount: 940,
    deadline: '2026-11-15',
    featured: true,
    urgent: true,
    staffPick: true,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [],
    beneficiaryName: '2,000 Flood-Displaced Families',
    beneficiaryLocation: 'Darrang & Morigaon Districts, Assam',
    organizerName: 'Annapurna Seva Trust (Disaster Wing)',
    organizerRole: 'organization',
    organizerId: 'org-akshaya-patra-mitra',
    organizationId: 'org-akshaya-patra-mitra',
    organizationName: 'Annapurna Seva Trust',
    itemizedBudget: [
      { id: 'b1', item: '2,000 Dry Food Survival Bags (Chira, Gur, Biscuits)', amount: 1100000, description: '₹550 per ration pack' },
      { id: 'b2', item: '2,000 Water Purification & ORS Health Pouches', amount: 480000, description: 'Chlorine tablets & essential remedies' },
      { id: 'b3', item: '2,000 Heavy-duty Tarpaulin Sheets & Nets', amount: 560000, description: 'Shelter cover against monsoons' },
      { id: 'b4', item: 'Motorized Rescue Boats Fuel & Field Dispatch', amount: 260000, description: 'Last-mile delivery to cut-off sandbars' },
    ],
    useOfFunds: 'Direct bulk relief procurement and ground boat relief operations monitored with geotagged distribution receipts.',
    documents: [
      { id: 'd1', title: 'District Disaster Management Authority (DDMA) Coordination Letter', type: 'other', url: '#', verified: true },
      { id: 'd2', title: '80G Tax Exemption Certificate', type: 'tax_cert', url: '#', verified: true },
    ],
    createdAt: '2026-10-01T06:00:00Z',
    updatedAt: '2026-10-23T11:00:00Z',
  },
  {
    id: 'camp-mission-100-cataract',
    slug: 'restore-vision-100-elderly-cataract-surgeries',
    title: 'Mission Drishti: Restore Vision with 100 Free Cataract Surgeries for Seniors',
    shortDescription: 'Thousands of poor rural elders suffer avoidable blindness simply because they cannot afford a ₹3,000 IOL cataract surgery. Sponsor vision for a grandmother today.',
    story: `In remote tribal blocks of southern Odisha, cataracts remain the leading cause of preventable blindness. Senior citizens who could otherwise lead active, joyful lives caring for their grandchildren are confined to dark rooms, unable to walk safely or earn meager daily wages.

Through Mission Drishti, mobile ophthalmic vans screen village elders, provide eye drops, and transport diagnosed patients to accredited base eye hospitals. Patients receive modern suture-less Phaco cataract extraction with high-quality Intraocular Lenses (IOL), post-op dark glasses, and 30 days of antiseptic eye drops.

At just ₹3,000 per surgery, you can gift someone the miraculous joy of seeing the faces of their children and grandchildren once again.`,
    category: 'elderly',
    campaignType: 'one-time',
    goalAmount: 300000,
    raisedAmount: 246000,
    supporterCount: 165,
    deadline: '2026-11-28',
    featured: false,
    urgent: false,
    staffPick: false,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [],
    beneficiaryName: '100 Rural Elders',
    beneficiaryLocation: 'Koraput & Rayagada, Odisha',
    organizerName: 'Asha Jyoti Foundation (Eye Care Cell)',
    organizerRole: 'organization',
    organizerId: 'org-hope-india',
    organizationId: 'org-hope-india',
    organizationName: 'Asha Jyoti Foundation',
    itemizedBudget: [
      { id: 'b1', item: '100 Foldable Intraocular Lens (IOL) Implants', amount: 150000, description: '₹1,500 per certified lens' },
      { id: 'b2', item: 'Operation Theater Consumables & Viscoelastic Gel', amount: 80000, description: 'Surgical disposables and antibiotics' },
      { id: 'b3', item: 'Mobile Van Patient Transport & Post-Op Glasses', amount: 70000, description: 'Transport from interior hamlets to hospital' },
    ],
    useOfFunds: 'Base eye hospital surgical theater costs, lenses, and follow-up vision checks.',
    documents: [
      { id: 'd1', title: 'Hospital Partnership Agreement & Surgeon Credentials', type: 'other', url: '#', verified: true },
      { id: 'd2', title: '12A & 80G Tax Exemption Documents', type: 'tax_cert', url: '#', verified: true },
    ],
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-10-21T18:00:00Z',
  },
  {
    id: 'camp-winter-blankets-delhi',
    slug: 'warm-winter-drive-3000-blankets-homeless-delhi',
    title: 'Winter Warmth: Distribute 3,000 Thick Woolen Blankets to Homeless in Delhi-NCR',
    shortDescription: 'As northern winter temperatures plummet below 4°C, thousands of homeless elders and children on Delhi streets suffer hypothermia. Donate blankets to save lives.',
    story: `Every winter, hundreds of homeless individuals across North India lose their lives to severe cold exposure. Many are rickshaw pullers, construction laborers, or abandoned elderly who sleep on concrete flyover underpasses, temple steps, and railway station perimeters.

Through our annual Winter Warmth drive, our night distribution teams travel across Delhi, Ghaziabad, and Noida between 11 PM and 3 AM, directly covering sleeping individuals with heavy-gauge, durable thermal blankets.

Each blanket costs ₹300 directly from the manufacturer in Panipat. Our distribution is documented with photo proofs and GPS checkpoints.`,
    category: 'essential-supplies',
    campaignType: 'product',
    goalAmount: 900000,
    raisedAmount: 645000,
    supporterCount: 710,
    deadline: '2026-12-20',
    featured: false,
    urgent: true,
    staffPick: true,
    status: 'active',
    verifiedStatus: 'verified',
    has80G: true,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [],
    beneficiaryName: '3,000 Homeless Citizens',
    beneficiaryLocation: 'Delhi-NCR',
    organizerName: 'Annapurna Seva Trust',
    organizerRole: 'organization',
    organizerId: 'org-akshaya-patra-mitra',
    organizationId: 'org-akshaya-patra-mitra',
    organizationName: 'Annapurna Seva Trust',
    itemizedBudget: [
      { id: 'b1', item: '3,000 Double-ply Polar Woolen Blankets', amount: 750000, description: '₹250 per blanket ex-mill' },
      { id: 'b2', item: 'Warehousing, Freight Transport & Packaging', amount: 90000, description: 'Bulk transport to 5 distribution hubs' },
      { id: 'b3', item: 'Night Patrol Vehicles & Distribution Logistics', amount: 60000, description: 'Fuel and nighttime field coordinators' },
    ],
    useOfFunds: 'Direct blanket procurement and nighttime street distribution across Delhi-NCR.',
    documents: [
      { id: 'd1', title: 'Manufacturer Invoice Quotation', type: 'other', url: '#', verified: true },
      { id: 'd2', title: '80G Tax Exemption Certificate', type: 'tax_cert', url: '#', verified: true },
    ],
    createdAt: '2026-10-05T15:00:00Z',
    updatedAt: '2026-10-23T12:00:00Z',
  },
];
