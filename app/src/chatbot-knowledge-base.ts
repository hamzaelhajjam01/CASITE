/**
 * PolarGuard Insurance - Comprehensive Chatbot Knowledge Base
 *
 * This file contains all possible customer questions and answers
 * organized by category. No LLM API required - all responses are predefined.
 */

export interface ChatbotQA {
  id: string;
  category: string;
  intents: string[]; // Keywords/patterns to match user input
  question: string;
  answer: string;
  followUp?: string[]; // Suggested follow-up questions
}

export const CHATBOT_QA_DATABASE: ChatbotQA[] = [
  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 1: ABOUT POLARGUARD
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'about-1',
    category: 'About PolarGuard',
    intents: ['who are you', 'what is polarguard', 'about polarguard', 'tell me about you', 'who underwrites', 'is this real insurance', 'td insurance', 'who is the underwriter', 'is polarguard the insurer'],
    question: 'Who is PolarGuard Insurance?',
    answer: `PolarGuard Insurance is an independent Canadian auto brokerage specializing in prepaid VIN-based auto insurance. We're a licensed broker — your policy is actually underwritten by TD Insurance (TD General Insurance Company), a federally regulated Canadian insurer. You receive an official TD pink card as your proof of insurance, accepted at provincial registries across Canada. We offer 1, 3, 6, or 12-month prepaid terms, all reviewed and matched by a licensed broker before activation.`,
    followUp: ['What coverage do you offer?', 'How do I get a quote?', 'Who can get coverage?']
  },

  {
    id: 'about-2',
    category: 'About PolarGuard',
    intents: ['what do you offer', 'what services', 'what can you do', 'products'],
    question: 'What services does PolarGuard offer?',
    answer: `We specialize in prepaid VIN-based auto insurance for Canadian drivers, underwritten by TD Insurance. Our services include:
• Quick VIN-based quotes (under 5 minutes)
• Flexible terms: 1, 3, 6, or 12 months prepaid (save 15% on 6 months, 25% on 12 months)
• Two coverage tiers: Basic (liability) or Full (liability + collision + comprehensive)
• No background checks required on short-term (1-3 month) policies
• Pay by Interac e-Transfer — broker matches your payment in 15-25 minutes
• Official TD pink card once payment is verified
• Accident Forgiveness and a Disappearing Deductible
• 24/7 roadside assistance`,
    followUp: ['How much does it cost?', 'What coverage options do I have?', 'How do I get started?']
  },

  {
    id: 'about-3',
    category: 'About PolarGuard',
    intents: ['why choose', 'why polarguard', 'what makes you different', 'benefits'],
    question: 'Why should I choose PolarGuard?',
    answer: `Here are the key reasons to choose PolarGuard:

✓ Fast: Get a quote in under 5 minutes, activate in 15-25 minutes after payment
✓ No Background Checks: Short-term (1-3 month) policies skip the driver history pull
✓ Flexible Terms: 1, 3, 6, or 12-month prepaid — save 15-25% on longer terms
✓ Accident Forgiveness: Your first at-fault accident won't raise your premium
✓ Disappearing Deductible: Drops every claim-free year, down to $0 after 5 years
✓ Clean Slate: Previous cancellations or lapses don't count against you
✓ Backed by TD: Underwritten by TD Insurance, a major Canadian insurer
✓ Easy Process: Just your VIN, license class, and postal code to start
✓ Licensed Broker: Every application is reviewed before activation`,
    followUp: ['How much does it cost?', 'How do I get a quote?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 2: PRICING & QUOTES
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'price-1',
    category: 'Pricing & Quotes',
    intents: ['how much', 'cost', 'price', 'expensive', 'affordable', 'rates'],
    question: 'How much does insurance cost?',
    answer: `Your price depends on:
• Coverage tier — Basic (liability) or Full (liability + collision + comprehensive)
• Term length — 1, 3, 6, or 12 months (longer terms save 15-25%)
• Deductible — $500 or $1,000
• Vehicle, driver profile, and postal code/province

Example (3-month prepaid term): Basic coverage around $481, Full coverage around $722 — paid once, no monthly billing. Get your exact quote in under 5 minutes by entering your VIN.`,
    followUp: ['Get a quote', 'What coverage options are available?', 'Can I customize my coverage?']
  },

  {
    id: 'price-2',
    category: 'Pricing & Quotes',
    intents: ['get a quote', 'quote me', 'how to quote', 'quote process', 'free quote'],
    question: 'How do I get a quote?',
    answer: `Getting a quote from PolarGuard is simple:

1. Enter your 17-character VIN — we decode your vehicle automatically
2. Add your license class (G/G2/G1), date of birth, and postal code
3. Choose your coverage tier (Basic or Full), deductible, and term (1/3/6/12 months)
4. Review your quote preview and fill in your name and address for your pink card
5. Pay by Interac e-Transfer and upload your payment screenshot
6. A licensed broker matches your payment and unlocks your TD pink card — usually in 15-25 minutes

That's it! Getting to a quote preview takes under 5 minutes. Note: your quote preview holds for about 30 minutes, so it's best to complete payment before it expires.

👉 Ready to start? Click "Get My Pink Slip" to begin!`,
    followUp: ['Where do I find my VIN?', 'What information do I need?', 'How long does it take?']
  },

  {
    id: 'price-3',
    category: 'Pricing & Quotes',
    intents: ['why is price', 'pricing different', 'rate factors', 'what affects price'],
    question: 'What factors affect my insurance price?',
    answer: `Your insurance cost depends on these key factors:

📍 VEHICLE FACTORS:
• Make and model
• Year of manufacture
• Current market value
• Safety features and equipment

👤 DRIVER FACTORS:
• Age and driving experience
• Claims history (in last 3 years)
• Driving record
• License status

🛣️ COVERAGE FACTORS:
• Liability limits
• Collision coverage
• Comprehensive coverage
• Deductible amount

The good news: With PolarGuard, previous cancellations and lapses don't count against you!`,
    followUp: ['Can I lower my premium?', 'What are deductibles?', 'What coverage do I need?']
  },

  {
    id: 'price-4',
    category: 'Pricing & Quotes',
    intents: ['customize quote', 'adjust coverage', 'change deductible', 'lower premium', 'customize my coverage', 'customize coverage', 'lower my premium'],
    question: 'Can I customize my insurance coverage and price?',
    answer: `Absolutely! You have full control over your coverage:

🎯 CHOOSE YOUR DEDUCTIBLE:
• $500 - Lower out-of-pocket if you claim
• $1,000 - Saves about 10% on your premium

📋 CHOOSE YOUR TIER:
• Basic - Third-party liability, direct compensation for property damage, and uninsured automobile protection
• Full (recommended) - Everything in Basic, plus collision, comprehensive, glass/windshield, and loss-of-use coverage

📅 CHOOSE YOUR TERM:
• 1 month - standard rate plus a short-term surcharge (~41%)
• 3 months - standard rate
• 6 months - save 15%
• 12 months - save 25%

💡 TIPS TO LOWER YOUR PREMIUM:
1. Choose the $1,000 deductible
2. Pick a longer term (6 or 12 months) for the built-in discount
3. Choose Basic if you don't need collision/comprehensive
4. Bundle multiple vehicles for a 20% discount

Try different combinations in the quote tool!`,
    followUp: ['What does liability cover?', 'Should I get comprehensive?', 'What is a deductible?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 3: COVERAGE EXPLAINED
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'coverage-1',
    category: 'Coverage',
    intents: ['what coverage', 'coverage options', 'what is covered', 'coverage types', 'what should i choose', 'which should i choose', 'which coverage should i choose', 'do i need both', 'learn about coverage', 'what do i have in my quote'],
    question: 'What coverage options are available?',
    answer: `We offer two coverage tiers — pick the one that fits your needs:

1️⃣ BASIC
   • Third-Party Liability: $1,000,000
   • Accident Benefits: provincial minimums
   • Direct Compensation - Property Damage: included, $0 deductible
   • Uninsured Automobile: up to $200,000
   • Collision, comprehensive, glass, and loss of use: not included

2️⃣ FULL (recommended)
   • Third-Party Liability: $2,000,000
   • Accident Benefits: enhanced — up to $1M medical, $1,000/week income replacement
   • Direct Compensation - Property Damage: included, $0 deductible
   • Uninsured Automobile: up to $200,000
   • Collision: included ($500 or $1,000 deductible)
   • Comprehensive: included ($500 or $1,000 deductible), theft/fire/vandalism/hail/animal strike
   • Glass/Windshield: included under comprehensive
   • Loss of Use (rental after a covered claim): up to $900 / 30 days

Both tiers also include Accident Forgiveness and a Disappearing Deductible.

💡 Most drivers choose Full for complete protection, especially on financed or newer vehicles.`,
    followUp: ['What should I choose?', 'What is a deductible?', 'Can I just get liability?']
  },

  {
    id: 'coverage-2',
    category: 'Coverage',
    intents: ['liability', 'liability coverage', 'what does liability cover', 'change my limits', 'increase my limits', 'liability limits'],
    question: 'What does liability coverage include?',
    answer: `Liability coverage covers:

✓ BODILY INJURY LIABILITY
   • Medical bills of people injured in an accident you cause
   • Lost wages due to injury
   • Pain and suffering compensation

✓ PROPERTY DAMAGE LIABILITY
   • Repairs to vehicles you hit
   • Damage to buildings, fences

⚠️ WHAT IT DOESN'T COVER:
   • Your own vehicle damage
   • Your own medical bills
   • Your own lost wages

💡 KEY FACTS:
   • Legally required in every Canadian province
   • PolarGuard offers $1,000,000 in liability on Basic and $2,000,000 on Full
   • Only covers damage YOU cause to others
   • Failure to carry it results in fines and license suspension

Think of it as protecting your finances if you're responsible for an accident. This is why it's mandatory!`,
    followUp: ['Do I need collision too?', 'What do I have in my quote?', 'Can I change my limits?']
  },

  {
    id: 'coverage-3',
    category: 'Coverage',
    intents: ['collision', 'collision coverage', 'what does collision'],
    question: 'What does collision coverage cover?',
    answer: `Collision coverage protects YOUR vehicle from accidents:

✓ WHAT'S COVERED:
   • Hitting another vehicle (even if you're at fault)
   • Hitting stationary objects (poles, buildings, fences)
   • Roll-over accidents
   • Your car is hit by an insured motorist (minus deductible)
   • Accidents in parking lots

❌ WHAT'S NOT COVERED:
   • Theft (covered by comprehensive instead)
   • Vandalism (covered by comprehensive)
   • Weather damage (comprehensive covers this)
   • Animal collision (comprehensive covers this)

💰 DEDUCTIBLE:
   • You pay this out-of-pocket when you claim
   • Higher deductible = lower premium (about 10% less)
   • Choose $500 or $1,000
   • Collision is included with our Full coverage tier (not Basic)

💡 EXAMPLE:
   You hit a pole and cause $4,200 damage. With $500 deductible, your insurance pays $3,700 and you pay $500. With $1,000 deductible, insurance pays $3,200 and you pay $1,000.`,
    followUp: ['Should I get comprehensive too?', 'What deductible should I choose?', 'What is a deductible?']
  },

  {
    id: 'coverage-4',
    category: 'Coverage',
    intents: ['comprehensive', 'comprehensive coverage', 'what does comprehensive', 'theft coverage'],
    question: 'What does comprehensive coverage cover?',
    answer: `Comprehensive coverage protects YOUR vehicle from non-collision damage:

✓ WHAT'S COVERED:
   • Theft or attempted theft
   • Vandalism (broken windows, graffiti, keyed paint)
   • Weather damage (hail, windstorms, flooding)
   • Animal collision (hitting deer, moose, etc.)
   • Falling objects (tree branches, debris)
   • Broken windshields or glass
   • Fire or explosion

❌ WHAT'S NOT COVERED:
   • Accidents/collisions (that's collision coverage)
   • Mechanical breakdown
   • Wear and tear
   • Maintenance items

💰 DEDUCTIBLE:
   • Same choices as collision: $500 or $1,000
   • Comprehensive is included with our Full coverage tier (not Basic)
   • Windshield/glass claims are included under comprehensive

💡 EXAMPLE:
   Your car is damaged by hail. Damage is $3,500. With $500 comprehensive deductible:
   • Your insurance pays: $3,000
   • You pay: $500

Canadian winters & wildlife make this coverage valuable!`,
    followUp: ['Should I get collision too?', 'What deductible should I choose?', 'Do I need both?']
  },

  {
    id: 'coverage-5',
    category: 'Coverage',
    intents: ['what is a deductible', 'deductible', 'deductible amount'],
    question: 'What is a deductible and how does it work?',
    answer: `A deductible is the amount YOU pay out-of-pocket when you file an insurance claim.

💡 HOW IT WORKS:

EXAMPLE: You have a $4,200 repair bill
• With $500 deductible: insurer pays $3,700, you pay $500
• With $1,000 deductible: insurer pays $3,200, you pay $1,000

🎯 DEDUCTIBLE OPTIONS (Full coverage tier only):

$500 DEDUCTIBLE:
   ✓ Lower out-of-pocket if you ever claim
   ✓ Adds about $80 per term to your premium vs. $1,000

$1,000 DEDUCTIBLE:
   ✓ Saves about 10% on your premium
   ✓ Higher out-of-pocket per claim

⚠️ IMPORTANT FACTS:
   • You choose your deductible when getting your quote
   • It's not an extra charge — it's only what you'd pay if you ever file a claim
   • The Disappearing Deductible feature lowers it further each claim-free year, down to $0 after 5 years
   • Deductible only applies to collision and comprehensive claims (Direct Compensation-Property Damage has $0 deductible)

💭 WHICH SHOULD YOU CHOOSE?
   • Want lower out-of-pocket if something happens? Go with $500
   • Want the lowest premium and rarely claim? Go with $1,000`,
    followUp: ['What deductible should I choose?', 'How much will I pay monthly?', 'Get a quote']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 4: ELIGIBILITY & REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'eligibility-1',
    category: 'Eligibility',
    intents: ['who can get coverage', 'am i eligible', 'can i qualify', 'requirements', 'how do i check my eligibility', 'check my eligibility'],
    question: 'Who can get coverage from PolarGuard?',
    answer: `PolarGuard serves most Canadian drivers!

✅ YOU LIKELY QUALIFY IF:
   • You're 18+ years old with a valid driver's license (G/G2/G1 or equivalent)
   • You live in Canada (any province/territory)
   • Your vehicle is registered in Canada
   • You have a valid VIN
   • You want a 1, 3, 6, or 12-month prepaid term

🚗 VEHICLES WE COVER:
   • Sedans and coupes
   • SUVs and crossovers
   • Trucks (personal use)
   • Vans and minivans
   • Hatchbacks
   • Wagons

❌ LIMITATIONS:
   • Must be 18+ years old
   • Vehicle must be street-legal and registered
   • Commercial vehicles may have higher rates

🎉 GREAT NEWS FOR:
   • High-risk drivers - we don't penalize past claims
   • New drivers - we offer competitive rates
   • Drivers with policy lapses - no penalty
   • Drivers with cancellations - clean slate!

Have questions about your specific situation? Chat with our broker!`,
    followUp: ['How do I check my eligibility?', 'What if I have a bad driving record?', 'Get a quote']
  },

  {
    id: 'eligibility-2',
    category: 'Eligibility',
    intents: ['young driver', 'new driver', 'teen driver', 'under 25', 'age requirement', 'years old', 'how old do i need to be', 'minimum age', 'is that ok', 'im 18', 'im 19', 'im 20'],
    question: 'Can young drivers get coverage?',
    answer: `Yes! PolarGuard insures young drivers starting at age 18.

📋 FOR DRIVERS AGES 18-24:
   • You CAN get quotes and coverage
   • Rates are higher than older drivers (industry-standard)
   • No background check required - big advantage!
   • Clean slate policy means your limited driving history doesn't hurt

✅ WHAT YOU NEED:
   • Valid driver's license (G2 or full G in Ontario)
   • Vehicle VIN
   • Vehicle registration
   • Basic driver info
   • Proof of residency

💡 YOUNG DRIVER TIPS:
   • Higher deductible ($500+) keeps premiums down
   • Bundle with family vehicles if possible
   • Take a defensive driving course (sometimes reduces rates)
   • Avoid collision/comprehensive if vehicle value is low

Ready to get your first quote? We make it easy!`,
    followUp: ['How much will it cost?', 'What coverage do I need?', 'Get a quote']
  },

  {
    id: 'eligibility-3',
    category: 'Eligibility',
    intents: ['bad driving record', 'previous claims', 'accidents', 'tickets'],
    question: 'Can I get coverage if I have a bad driving record?',
    answer: `Great news! PolarGuard is specifically designed for drivers with challenging histories.

✅ WE COVER DRIVERS WITH:
   • Previous at-fault accidents/claims
   • Traffic tickets and violations
   • Speeding tickets
   • Distracted driving tickets
   • Previous policy cancellations
   • Previous policy lapses
   • Multiple claims in last 3 years
   • DUI/DWI convictions (may apply)

🎉 HERE'S THE BIG DIFFERENCE:
   Most insurers charge massive premiums for these issues. PolarGuard:

   • Doesn't penalize you for previous cancellations
   • Doesn't penalize you for coverage gaps/lapses
   • Looks at your recent driving record (last 3 years)
   • Treats you fairly based on your CURRENT driving

Have a specific situation? Our brokers review applications daily and often find coverage!`,
    followUp: ['How much will coverage cost?', 'What information do I need to provide?', 'Get a quote']
  },

  {
    id: 'eligibility-4',
    category: 'Eligibility',
    intents: ['policy lapse', 'no insurance', 'gap in coverage', 'previous cancellation', 'lapse in insurance', 'insurance lapsed', 'lapsed', 'had a lapse', 'coverage lapsed'],
    question: 'Can I get coverage if I had a lapse in insurance?',
    answer: `YES! This is one of the biggest advantages of choosing PolarGuard.

🎉 THE POLARGUARD DIFFERENCE:
   Most insurers penalize you heavily for coverage gaps. PolarGuard doesn't.

   We understand that life happens:
   • Couldn't afford insurance for a month
   • Forgot to renew your policy
   • Switched insurers and had a gap
   • Had a cancellation and reapplying

💡 WITH POLARGUARD:
   ✓ Your policy lapse DOESN'T count against you
   ✓ We won't charge "lapses penalty" premiums
   ✓ You get clean slate pricing

⚠️ IMPORTANT LEGAL INFO:
   • Driving without insurance is illegal in Canada
   • Our same-day activation means you can be covered immediately
   • Don't drive uninsured - activate your policy first

Ready to close that gap and get back on the road legally?`,
    followUp: ['How fast can I get coverage?', 'How much will it cost?', 'Get a quote']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 5: THE PROCESS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'process-1',
    category: 'Process',
    intents: ['how does it work', 'process', 'steps', 'how do i start', 'how do i activate', 'how do i get started', 'get started'],
    question: 'How does the PolarGuard process work?',
    answer: `Getting insured with PolarGuard takes 3 simple steps:

⏱️ TOTAL TIME: Under 5 minutes to a quote preview, 15-25 minutes to activation after payment

STEP 1️⃣: GET YOUR QUOTE PREVIEW (2-3 minutes)
   1. Enter your VIN — we auto-decode your vehicle
   2. Add your license class, date of birth, and postal code
   3. Choose your coverage tier (Basic or Full), deductible ($500/$1,000), and term (1/3/6/12 months)
   4. Fill in your name and address for your TD pink card
   5. Your quote preview holds for about 30 minutes

STEP 2️⃣: PAY BY INTERAC E-TRANSFER
   • Send the e-Transfer for your exact quoted amount
   • Upload a screenshot of the transfer confirmation
   • No credit card needed

STEP 3️⃣: BROKER MATCH & ACTIVATION (15-25 minutes)
   • A licensed broker matches your e-Transfer to your application
   • Your TD pink card unlocks once payment is verified
   • Download your pink card — you're covered

📱 YOU'LL GET:
   ✓ Official TD pink card (proof of insurance)
   ✓ Digital policy documents
   ✓ Broker contact info
   ✓ 24/7 roadside assistance included

🎯 KEY ADVANTAGES:
   ✓ Activation in 15-25 minutes, not days
   ✓ No complex forms - just VIN, license, and postal code to start
   ✓ No background checks on 1-3 month terms
   ✓ No hidden fees
   ✓ No long-term commitment

Ready to start? Click "Get My Pink Slip" now!`,
    followUp: ['Where do I find my VIN?', 'What information do I need?', 'How fast is activation?']
  },

  {
    id: 'process-2',
    category: 'Process',
    intents: ['where is vin', 'find vin', 'vin number', 'what is vin', 'where do i find my vin', 'find my vin', 'where is my vin', 'cant find my vin', 'locate my vin'],
    question: 'Where do I find my VIN?',
    answer: `Your VIN (Vehicle Identification Number) is a 17-character code that uniquely identifies your vehicle.

🚗 WHERE TO FIND IT:

LOCATION 1: Dashboard (easiest)
   • Look at the bottom left corner of your windshield
   • Read from outside the car
   • The VIN is stamped into the dash

LOCATION 2: Vehicle Registration
   • Check your vehicle registration certificate
   • Province registration document lists VIN
   • Insurance card might show it too

LOCATION 3: Insurance Card
   • Previous insurance company's card
   • Current/old policy documents

LOCATION 4: Vehicle Door Frame
   • Driver's side door frame
   • Look on the door jamb

LOCATION 5: Purchase Documents
   • Bill of sale
   • Loan/financing documents
   • Dealership paperwork

📝 WHAT IT LOOKS LIKE:
   Example: 1HGCV41387A123456
   • Exactly 17 characters
   • Mix of letters and numbers
   • NO O, I, or Q characters

💡 TIPS:
   • Copy it carefully
   • No spaces or dashes in VIN
   • If you can't find it, we can help via chat

Once you have your VIN, you're ready for your quote!`,
    followUp: ['Get a quote', 'What information do I need?', 'I still can\'t find my VIN']
  },

  {
    id: 'process-3',
    category: 'Process',
    intents: ['what info do i need', 'information needed', 'what do you need', 'what information do i need', 'what do i need', 'documents needed', 'what do i need to apply'],
    question: 'What information do I need to get a quote?',
    answer: `We collect information in stages, so you don't have to fill out a giant form up front:

🚗 STEP 1 - VEHICLE:
   ✓ Your VIN (17-character code) — we decode the vehicle for you

👤 STEP 2 - DRIVER:
   ✓ License class (G/G2/G1 or equivalent)
   ✓ Date of birth
   ✓ Postal code (confirms your province)

📋 STEP 3 - COVERAGE:
   ✓ Coverage tier (Basic or Full)
   ✓ Deductible ($500 or $1,000)
   ✓ Term (1, 3, 6, or 12 months)

🪪 STEP 4 - PINK CARD DETAILS (at quote preview):
   ✓ Full legal name
   ✓ Street address, city, and postal code

📧 STEP 5 - AFTER PAYMENT:
   ✓ Email and phone number — collected when you upload your e-Transfer screenshot, so we can send your pink card and confirmation

⏱️ HOW LONG IT TAKES:
   • Quote preview: under 5 minutes
   • Payment + broker match: 15-25 minutes

Start your quote now - we make it simple!`,
    followUp: ['Get a quote', 'Where do I find my VIN?', 'What coverage should I choose?']
  },

  {
    id: 'process-4',
    category: 'Process',
    intents: ['how fast', 'how long', 'activation time', 'when can i drive', 'same day'],
    question: 'How quickly can I get coverage?',
    answer: `PolarGuard is built for speed. Here's the real timeline:

⚡ THE FAST TRACK:

IMMEDIATE (Right now):
   • Get your quote preview online: 2-3 minutes
   • See your exact price instantly
   • Quote preview holds for about 30 minutes — pay before it expires!

AFTER YOU PAY:
   • Send your Interac e-Transfer and upload the screenshot
   • A licensed broker matches your payment to your application
   • Typical match + activation time: 15-25 minutes

✅ TYPICAL TIMELINE:
   • 2:00 PM: You get your quote preview and pay by e-Transfer
   • 2:05 PM: You upload your payment screenshot
   • 2:20 PM: Broker matches your payment
   • 2:20 PM: Your TD pink card unlocks — you're covered!

🎯 BOTTOM LINE:
   Most drivers are covered in under 30 minutes from quote to pink card.

Ready to apply? Get started now!`,
    followUp: ['Get a quote', 'What information do I need?', 'How do I activate?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 6: CLAIMS & ACCIDENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'claims-1',
    category: 'Claims',
    intents: ['how to file claim', 'file a claim', 'had accident', 'i was in accident', 'i was in an accident', 'in an accident', 'got in an accident', 'car accident', 'i crashed', 'what do i do after an accident'],
    question: 'How do I file a claim if I have an accident?',
    answer: `Don't panic! Here's exactly what to do if you have an accident:

⏰ IMMEDIATE STEPS (At the scene):

1. SAFETY FIRST
   ✓ Check for injuries
   ✓ Call 911 if anyone is hurt
   ✓ Move to safety (if possible)
   ✓ Turn on hazard lights

2. GATHER INFORMATION
   ✓ Get other driver's name, phone, address
   ✓ Get other driver's license plate number
   ✓ Get other driver's insurance info
   ✓ Get driver's license number
   ✓ Get police report number
   ✓ Take photos of all vehicle damage
   ✓ Get contact info of any witnesses

📞 FILING THE CLAIM (Within 48 hours):

CALL US IMMEDIATELY:
   ☎️ PolarGuard Broker: +1 (579) 987-7798
   ☎️ Available: 24/7
   ☎️ Have ready: Policy number, driver license, claim details

GIVE US:
   ✓ Your policy number
   ✓ Date/time of accident
   ✓ Location details
   ✓ Description of what happened
   ✓ Other driver's information
   ✓ Police report number

🔄 AFTER YOU FILE:

1. Claim assignment within 24 hours
2. Damage inspection within 2-5 days
3. Claim decision and authorization
4. Repair authorization to shop
5. Vehicle repairs (7-14 days)
6. Claim closed and settled

⏱️ TYPICAL TIMELINE: 2-3 weeks total

Have you been in an accident? Contact us right away!`,
    followUp: ['What is the claims process timeline?', 'What if I\'m not at fault?', 'How much will it cost me?']
  },

  {
    id: 'claims-2',
    category: 'Claims',
    intents: ['not at fault claim', 'other driver fault', 'my insurance cost', 'other driver is at fault', 'other driver caused', 'not my fault', 'wasnt my fault', 'hit my car', 'somebody hit my car', 'someone hit my car', 'if the other driver', 'not at fault', 'im not at fault', 'theyre uninsured', 'other driver uninsured', 'uninsured driver', 'if theyre uninsured', 'partially at fault', 'both at fault', 'shared fault', 'both were at fault'],
    question: 'What happens if the other driver is at fault?',
    answer: `Great news - if the other driver caused the accident, the process is more favorable for you:

✅ THE SHORT VERSION:
   • Their insurance pays for repairs
   • You only pay your deductible
   • Your rates shouldn't increase
   • You have legal recourse

📋 HOW IT WORKS:

STEP 1: You file the claim
STEP 2: We investigate and determine liability
STEP 3: Other driver's insurance contacted
STEP 4: If they admit fault = easy process
STEP 5: Repairs authorized and completed
STEP 6: Claim settled

💰 FINANCIAL IMPACT:

YOUR COSTS:
   • Deductible: Usually waived in not-at-fault claims
   • Or deductible: Sometimes $0

INSURANCE COVERS:
   • All repair costs
   • Rental car (usually)
   • Your rates: NOT increased

📈 IMPACT ON YOUR RATES:
   ✓ NO rate increase for not-at-fault claims
   ✓ Doesn't count against your record
   ✓ Won't affect future quotes

This is HUGE advantage vs being at-fault!

⚠️ UNINSURED DRIVER?
   • Still file claim
   • Use your uninsured motorist coverage
   • You pay your deductible
   • We pursue recovery

This is why it's important to get the other driver's info!`,
    followUp: ['What if we both were partially at fault?', 'What if they\'re uninsured?', 'File a claim']
  },

  {
    id: 'claims-3',
    category: 'Claims',
    intents: ['deductible claim', 'pay deductible', 'out of pocket', 'claim cost'],
    question: 'How much will I pay out-of-pocket for a claim?',
    answer: `You'll only pay your chosen deductible:

💰 YOUR COST:
   Your deductible only

   Example:
   • Total damage: $4,500
   • Your deductible: $500
   • You pay: $500
   • Insurance pays: $4,000

🎯 DEDUCTIBLE AMOUNTS:
   • $500 deductible = You pay $500 per claim
   • $1,000 deductible = You pay $1,000 per claim
   • Disappearing Deductible: drops each claim-free year, down to $0 after 5 years

⚠️ IMPORTANT DEDUCTIBLE FACTS:
   • Applies PER claim (multiple claims = multiple deductibles)
   • Collision claims use collision deductible
   • Comprehensive claims use comprehensive deductible

❌ THINGS YOU DON'T PAY:

   ✗ Premiums during claim
   ✗ Admin fees
   ✗ Processing fees
   ✗ Inspection charges
   ✓ Just your deductible

✅ THINGS INSURANCE COVERS:

   ✓ Full repair costs (minus deductible)
   ✓ Rental car (usually)
   ✓ Towing/roadside assistance
   ✓ Parts and labor
   ✓ Quality control inspection

📱 SPECIAL CASES:

WINDSHIELD CLAIMS:
   • Often $0 deductible
   • Full glass coverage

NOT-AT-FAULT CLAIMS:
   • You might not pay deductible
   • Depends on other insurer payment

Ready to file a claim?`,
    followUp: ['What if I can\'t afford my deductible?', 'Can I change my deductible?', 'File a claim']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 7: POLICIES & TERMS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'policy-1',
    category: 'Policies',
    intents: ['term length', 'how long', 'policy length', 'coverage length', '3 month', 'how long is my policy', 'length of my policy', 'how long does my policy last', 'what happens after 3 months', 'how do i renew', 'renew my policy', 'renewal', 'can i renew'],
    question: 'How long is my insurance policy?',
    answer: `PolarGuard offers flexible prepaid terms — you choose the length:

📅 TERM OPTIONS:
   • 1 month — good for a quick plate renewal or short-term need (small surcharge, ~41% vs the 3-month rate)
   • 3 months — our standard term
   • 6 months — save 15% vs. paying month-to-month at the 3-month rate
   • 12 months — save 25%, our best value

You pay once for the full term — no monthly billing, no long-term contract.

🔄 RENEWAL OPTIONS:

CONTINUE WITH US:
   • Get a fresh quote and pay for your next term
   • Same or updated coverage, your choice

SWITCH TO ANOTHER INSURER:
   • Cancel anytime (no penalty)
   • No early termination fees
   • No lock-in contract

✅ ADVANTAGES OF PREPAID TERMS:

   ✓ No long-term commitment
   ✓ Easy to switch terms or insurers
   ✓ Longer terms save you real money (15-25%)
   ✓ Perfect for temporary or ongoing needs alike

📝 POLICY TIMELINE:

DAY 1: Coverage begins after payment is verified
DURING TERM: Your policy is active for the full 1/3/6/12 months you chose
END OF TERM: What's next?
   • RENEW: Get a new quote and pay for your next term
   • CANCEL: No cancellation fee
   • DO NOTHING: Coverage stops (becomes uninsured - illegal!)

⚠️ DON'T LET COVERAGE LAPSE:
   • Driving uninsured is illegal
   • Fines and license suspension can apply

Ready to pick your term and get started?`,
    followUp: ['Can I renew?', 'Can I cancel early?', 'What happens after 3 months?']
  },

  {
    id: 'policy-2',
    category: 'Policies',
    intents: ['cancel policy', 'early cancellation', 'termination', 'stop insurance', 'cancel anytime', 'cancel my policy', 'how do i cancel', 'can i cancel', 'cancel whenever', 'want to cancel', 'pause coverage', 'pause my policy', 'can i pause'],
    question: 'Can I cancel my policy anytime?',
    answer: `Yes! PolarGuard policies have no early cancellation penalties:

✅ CANCELLATION FLEXIBILITY:

You can cancel:
   • Anytime during your term - no penalties
   • No termination fees
   • No cancellation charges

🎯 HOW TO CANCEL:

OPTION 1 - PHONE:
   ☎️ Call our broker: +1 (579) 987-7798
   • Say you want to cancel
   • We process immediately
   • Confirmation emailed

OPTION 2 - EMAIL:
   📧 Email: support@polarguard.ca
   • Subject: "Cancel Policy [Your Policy #]"
   • Confirm 24-48 hour processing

💰 REFUNDS:

You get a prorated refund based on unused time in your term. For example, on a $722 3-month Full-coverage term, cancelling after 1 month refunds roughly two-thirds of what you paid.

🔄 SWITCHING INSURERS:

   1. Get quote from new insurer
   2. Get new policy confirmed
   3. Get new pink slip
   4. THEN cancel with us
   5. Never drive uninsured

💡 COMMON SCENARIOS:

SCENARIO 1: "I'm getting cheaper rate elsewhere"
   • Get new policy activated
   • Then cancel with us
   • Get refund for unused time
   • No penalty at all

SCENARIO 2: "I'm selling my car"
   • Cancel upon sale date
   • Get prorated refund
   • Easy process

This is one of our biggest advantages!`,
    followUp: ['How much will my refund be?', 'Can I pause coverage?', 'How do I renew?']
  },

  {
    id: 'policy-3',
    category: 'Policies',
    intents: ['discount', 'how to get discount', 'save money', 'discount codes', 'what else can i do to save', 'how else can i save'],
    question: 'What discounts are available?',
    answer: `PolarGuard's biggest savings come from term length and bundling:

💰 AVAILABLE DISCOUNTS:

LONGER TERM (built-in, automatic):
   • 6-month term: save 15% vs. the standard 3-month rate
   • 12-month term: save 25% vs. the standard 3-month rate

MULTI-VEHICLE BUNDLE:
   • Insure 2+ vehicles with us
   • Flat 20% discount on your policies
   • Great for families adding teen drivers without the sticker shock

HIGHER DEDUCTIBLE:
   • Choose $1,000 instead of $500
   • Saves about 10% on your premium

🔄 HOW TO GET DISCOUNTS:

   • Term and deductible discounts apply automatically when you choose them in your quote
   • Multi-vehicle bundling: mention your other vehicle(s) when you quote, or call our broker: +1 (579) 987-7798

📊 EXAMPLE:
   Full coverage, 3-month standard rate: $722
   → Choose 12-month term instead: save 25%
   → Add a second vehicle: save 20% more on top

💡 BEST WAY TO SAVE:
   1. Pick a 6 or 12-month term instead of 1 or 3 months
   2. Choose the $1,000 deductible if you rarely claim
   3. Bundle multiple vehicles for 20% off

Get your quote and see your savings!`,
    followUp: ['Get a quote', 'Do I qualify for any discounts?', 'What else can I do to save?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 8: SUPPORT & CONTACT
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'support-1',
    category: 'Support',
    intents: ['phone number', 'contact us', 'how to reach', 'support hours', 'customer service', 'contact support', 'how do i contact support'],
    question: 'How do I contact PolarGuard support?',
    answer: `Multiple ways to reach our team:

☎️ PHONE (Fastest):
   Main Line: +1 (579) 987-7798
   Hours: Monday-Friday 9 AM - 6 PM MT
   Saturdays: 10 AM - 4 PM MT

📧 EMAIL:
   support@polarguard.ca
   Response time: 24-48 hours

💬 LIVE CHAT (Website):
   Available during business hours
   Fastest response time

📱 WhatsApp:
   +1 (579) 987-7798
   Available during business hours

🚨 EMERGENCY (24/7):
   Claims only: [24-hour emergency number]
   Vehicle accidents
   Roadside assistance emergencies

💬 WHAT YOU CAN DO ONLINE:
   ✓ Check policy details
   ✓ Make payments
   ✓ Download documents
   ✓ Manage personal info
   ✓ File claims
   ✓ Renew policy

Have a question? Reach out - we're here to help!`,
    followUp: ['I have a question...', 'File a claim', 'Get a quote']
  },

  {
    id: 'support-2',
    category: 'Support',
    intents: ['general question', 'need help', 'lost', 'confused', 'where to start', 'where do i start', 'i have questions', 'where should i start', 'i have a question'],
    question: 'I have questions - where do I start?',
    answer: `Great question! Here are your options:

🎯 IF YOU WANT A QUOTE:
   1. Click "Get My Pink Slip" button
   2. Have your VIN ready
   3. Takes 2-3 minutes
   4. Get instant quote
   → Or ask me in this chat!

📋 IF YOU WANT TO LEARN ABOUT COVERAGE:
   1. Ask in this chat (I'm here to help!)
   2. Call our broker: +1 (579) 987-7798
   3. Visit our FAQ section

💳 IF YOU HAVE BILLING QUESTIONS:
   1. Check your email for invoice
   2. Call +1 (579) 987-7798
   3. Login to check payment history

🚗 IF YOU WERE IN AN ACCIDENT:
   1. Call immediately: +1 (579) 987-7798
   2. Have policy number ready
   3. 24/7 emergency line available

✓ IF YOU WANT TO RENEW:
   1. Call: +1 (579) 987-7798
   2. Online: Policy management portal
   3. Email: support@polarguard.ca

❌ IF YOU WANT TO CANCEL:
   1. Call: +1 (579) 987-7798
   2. Online: Policy management
   3. Email: support@polarguard.ca
   → Easy process, no penalties!

What can I help you with today?`,
    followUp: ['Get a quote', 'Learn about coverage', 'Contact support']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 9: GENERAL / GREETING
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'general-1',
    category: 'General',
    intents: ['hello', 'hi there', 'hey there', ' hi ', 'good morning', 'good afternoon', 'howdy', ' yo '],
    question: 'Hi! How can I help you today?',
    answer: `👋 Welcome to PolarGuard Insurance!

I can help with:
• Getting a quote
• Coverage options (liability, collision, comprehensive)
• Pricing & discounts
• Eligibility (bad record, young drivers, lapses)
• Claims & accidents
• Policy terms & cancellation

What would you like to know? Or call us directly: +1 (579) 987-7798`,
    followUp: ['Get a quote', 'What coverage do I need?', 'How much does it cost?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 10: UNDERWRITING DETAILS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'driver-1',
    category: 'Eligibility',
    intents: ['background check', 'credit check', 'credit score', 'do you check my credit', 'criminal record'],
    question: 'Do you check my credit or run a background check?',
    answer: `No credit checks, and no background/driver-history pull on short-term (1-3 month) policies.

✅ WHAT WE DON'T DO:
   • Credit checks or credit scores
   • Criminal background checks
   • Employment verification
   • Driver history pull on 1-3 month terms — you're rated as a clean, low-risk driver regardless of past history

🎯 WHAT WE DO CHECK:
   • Your driving record (as you disclose it)
   • Your license is valid and active
   • Your insurance/claims history

⚠️ IMPORTANT: You must disclose accidents, tickets, claims, and cancellations honestly. Providing false information voids the policy — but honesty usually gets you a *better* rate, not a worse one.

This is one of the biggest reasons drivers with credit issues or past problems choose PolarGuard.`,
    followUp: ['Can I get coverage with a bad driving record?', 'What information do I need?', 'Get a quote']
  },

  {
    id: 'policy-4',
    category: 'Policies',
    intents: ['not covered', 'excluded', 'exclusions', 'whats not covered', "what's not covered", 'does not cover'],
    question: 'What is NOT covered by my policy?',
    answer: `Common exclusions to be aware of:

❌ NOT COVERED:
   • Intentional damage or fraud
   • Using your vehicle for crimes or racing
   • Business/commercial use if not disclosed (rideshare, delivery)
   • Mechanical breakdown & normal wear and tear
   • Maintenance (tires, brakes, oil changes)
   • Traffic/parking tickets and fines
   • Personal items stolen from the car (electronics, luggage)
   • Driving without a valid license or while suspended
   • Damage that existed before your policy started

✅ WHAT IS COVERED (with the right plan):
   • Collision accidents
   • Theft, vandalism, weather, animal strikes (comprehensive)
   • Liability to others
   • Glass/windshield (often $0 deductible)

Have a specific situation in mind? Ask me directly, or call our broker: +1 (579) 987-7798.`,
    followUp: ['What does comprehensive cover?', 'What is a deductible?', 'Get a quote']
  },

  {
    id: 'special-1',
    category: 'Eligibility',
    intents: ['financed vehicle', 'leased vehicle', 'car loan', 'still financing', 'still being financed', 'lienholder', 'lease company', 'leased car', 'financed car', 'insure a leased', 'car that is financed', 'car is financed'],
    question: 'Can I get insurance on a financed or leased vehicle?',
    answer: `Yes — both financed and leased vehicles can be insured.

💳 FINANCED (loan/mortgage on the vehicle):
   • You'll need collision + comprehensive (not liability-only)
   • Your lender is listed on the policy as loss payee
   • We need your lender's name, address, and loan/account number

🚗 LEASED:
   • Lease company has stricter requirements — usually full coverage with a specific (often lower) deductible
   • Lease company is listed as lienholder
   • Some leases also require separate GAP insurance (we don't provide this — check with your leasing company)

⚠️ Don't skip required coverage — if your lender/lessor learns you're under-insured, they can add their own (expensive) coverage or affect your loan/lease.

Have your loan or lease documents handy when you get your quote so we can add the lienholder correctly.`,
    followUp: ['Get a quote', 'What coverage do I need?', 'How much will it cost?']
  },

  {
    id: 'special-2',
    category: 'Eligibility',
    intents: ['motorcycle', 'do you cover motorcycles', 'rv', 'atv', 'trailer', 'commercial vehicle', 'what vehicles do you cover'],
    question: 'What types of vehicles do you cover?',
    answer: `PolarGuard focuses on personal auto insurance for:

✅ WE COVER:
   • Sedans & coupes
   • SUVs & crossovers
   • Trucks (personal use)
   • Vans & minivans
   • Hatchbacks & wagons

❌ WE DON'T CURRENTLY COVER:
   • Motorcycles
   • RVs / motorhomes
   • ATVs / off-road vehicles
   • Trailers (as standalone policies)
   • Commercial/business-use fleets

If you're not sure whether your vehicle qualifies, tell me the make and model — or call our broker: +1 (579) 987-7798.`,
    followUp: ['Who can get coverage?', 'How much does it cost?', 'Get a quote']
  },

  {
    id: 'billing-1',
    category: 'Policies',
    intents: ['miss a payment', 'missed payment', 'payment failed', 'late payment', 'didnt pay', "didn't pay"],
    question: 'What happens if I miss a payment?',
    answer: `Here's what happens if a payment doesn't go through:

⚠️ IMMEDIATE:
   • We'll try to notify you by email/phone right away
   • You typically have a short grace period to fix payment

❌ IF NOT RESOLVED:
   • Your policy can be cancelled for non-payment
   • Once cancelled, you're uninsured — illegal to drive
   • Reinstating after cancellation may require a new application

✅ HOW TO AVOID THIS:
   • Keep your card/payment method up to date
   • Set a reminder before your renewal date
   • Contact us proactively if you expect a payment issue: +1 (579) 987-7798

If a payment just failed, don't wait — call us before it lapses so we can help fix it without a coverage gap.`,
    followUp: ['Can I cancel anytime?', 'How do I renew?', 'Contact support']
  },

  {
    id: 'support-3',
    category: 'Support',
    intents: ['is there an app', 'mobile app', 'do you have an app', 'download app'],
    question: 'Is there a PolarGuard app?',
    answer: `We don't have a dedicated mobile app right now — everything is handled through our website, which works great on mobile browsers.

📱 FROM YOUR PHONE'S BROWSER YOU CAN:
   ✓ Get a quote
   ✓ View your digital pink slip
   ✓ Manage your policy
   ✓ Make payments
   ✓ File a claim
   ✓ Contact your broker

Just visit polarguardbrokerage.ca from any phone, tablet, or computer — no download needed.`,
    followUp: ['Get a quote', 'How do I contact support?', 'How do I file a claim?']
  },

  {
    id: 'payment-1',
    category: 'Process',
    intents: ['how do i pay', 'payment method', 'e-transfer', 'interac', 'how to pay', 'can i pay by credit card', 'credit card payment', 'do you accept credit card', 'how does payment work', 'ways to pay'],
    question: 'How do I pay for my policy?',
    answer: `We use Interac e-Transfer — no credit card needed:

💸 HOW IT WORKS:
   1. After your quote preview, you'll see the exact amount to send
   2. Send an Interac e-Transfer for that amount
   3. Upload a screenshot of your e-Transfer confirmation
   4. A licensed broker matches your payment to your application
   5. Once verified, your TD pink card unlocks — usually within 15-25 minutes

⚠️ IMPORTANT:
   • We don't currently accept credit or debit card payment directly
   • Your quote preview holds for about 30 minutes, so send your e-Transfer promptly
   • Make sure your screenshot clearly shows the amount, date, and reference number

Questions about a payment? Call our broker: +1 (579) 987-7798`,
    followUp: ['How long does it take to activate?', 'Get a quote', 'What information do I need?']
  },

  {
    id: 'coverage-6',
    category: 'Coverage',
    intents: ['accident forgiveness', 'first accident', 'will my rate go up', 'does an accident raise my rate', 'first at fault accident'],
    question: 'What is Accident Forgiveness?',
    answer: `Accident Forgiveness means your first at-fault accident won't increase your premium.

✓ We believe in second chances — one at-fault accident, on its own, won't drive your rate up at renewal.
✓ It applies automatically — no enrollment needed.
✓ It's included on our policies at no extra cost.

This is separate from your deductible — you'd still pay your deductible on the claim itself, but your future premium is protected.`,
    followUp: ['What is a deductible?', 'What if the other driver is at fault?', 'Get a quote']
  },

  {
    id: 'coverage-7',
    category: 'Coverage',
    intents: ['disappearing deductible', 'deductible drops', 'claim free discount', 'lower deductible over time', 'does my deductible go down'],
    question: 'What is the Disappearing Deductible?',
    answer: `Your deductible drops every year you stay claim-free — down to $0 after 5 years.

📉 HOW IT WORKS:
   • Start with your chosen deductible ($500 or $1,000)
   • Each claim-free year, it shrinks
   • After 5 consecutive claim-free years, it can reach $0

Safe driving pays off — literally. It's included automatically, no extra cost or enrollment needed.`,
    followUp: ['What is a deductible?', 'What is Accident Forgiveness?', 'Get a quote']
  }
];

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Find an answer by intent matching.
 *
 * Uses best-match scoring rather than "first array entry wins": every QA
 * entry is checked, and the one with the highest total score is returned.
 * Score per matched intent phrase = (word count)^2, so longer/more specific
 * phrases (e.g. "out of pocket") outrank short generic ones (e.g. "how much")
 * even if the generic one appears earlier in the database.
 */
export function findAnswerByIntent(userInput: string): ChatbotQA | null {
  const normalizedInput = ' ' + userInput.toLowerCase().trim().replace(/[?!.,’']/g, '') + ' ';

  let bestMatch: ChatbotQA | null = null;
  let bestScore = 0;

  for (const qa of CHATBOT_QA_DATABASE) {
    let score = 0;
    for (const intent of qa.intents) {
      const normalizedIntent = intent.toLowerCase();
      if (normalizedInput.includes(normalizedIntent)) {
        const wordCount = normalizedIntent.split(' ').length;
        score += wordCount * wordCount;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }

  return bestMatch;
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(CHATBOT_QA_DATABASE.map(qa => qa.category));
  return Array.from(categories).sort();
}

/**
 * Get all QA for a specific category
 */
export function getQAByCategory(category: string): ChatbotQA[] {
  return CHATBOT_QA_DATABASE.filter(qa => qa.category === category);
}

/**
 * Search QA by keyword
 */
export function searchQA(query: string): ChatbotQA[] {
  const normalizedQuery = query.toLowerCase();
  return CHATBOT_QA_DATABASE.filter(qa =>
    qa.question.toLowerCase().includes(normalizedQuery) ||
    qa.answer.toLowerCase().includes(normalizedQuery) ||
    qa.intents.some(intent => intent.includes(normalizedQuery))
  );
}

/**
 * Get random follow-up suggestions
 */
export function getFollowUpSuggestions(qaId: string): string[] {
  const qa = CHATBOT_QA_DATABASE.find(q => q.id === qaId);
  return qa?.followUp || [];
}
