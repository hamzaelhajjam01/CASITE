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
    intents: ['who are you', 'what is polarguard', 'about polarguard', 'tell me about you'],
    question: 'Who is PolarGuard Insurance?',
    answer: `PolarGuard Insurance is an independent Canadian auto brokerage specializing in short-term prepaid auto insurance. We operate as a licensed insurance broker and offer 3-month prepaid quote previews with same-day broker review. We serve drivers across Canada who need flexible, short-term coverage without long-term commitments.`,
    followUp: ['What coverage do you offer?', 'How do I get a quote?', 'Who can get coverage?']
  },

  {
    id: 'about-2',
    category: 'About PolarGuard',
    intents: ['what do you offer', 'what services', 'what can you do', 'products'],
    question: 'What services does PolarGuard offer?',
    answer: `We specialize in short-term auto insurance (1-3 months) for Canadian drivers. Our services include:
• Quick VIN-based quotes (under 5 minutes)
• Same-day policy activation
• Full coverage options including liability, collision, and comprehensive
• No background checks required
• Low-risk driver rates
• Flexible 3-month prepaid policies
• 24/7 broker support`,
    followUp: ['How much does it cost?', 'What coverage options do I have?', 'How do I get started?']
  },

  {
    id: 'about-3',
    category: 'About PolarGuard',
    intents: ['why choose', 'why polarguard', 'what makes you different', 'benefits'],
    question: 'Why should I choose PolarGuard?',
    answer: `Here are the key reasons to choose PolarGuard:

✓ Fast: Get a quote in under 5 minutes, activate same-day
✓ No Background Checks: Low-risk drivers aren't penalized for past history
✓ Flexible: 3-month prepaid policies - no long-term commitment
✓ Same-Day Activation: Drive legally from the moment you activate
✓ Clean Slate: Previous cancellations or lapses don't count against you
✓ Best Rates: Competitive pricing for short-term coverage
✓ Easy Process: Just your VIN and a few details
✓ Licensed Broker: Regulated and trusted in Canada`,
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
    answer: `Insurance costs vary based on:
• Vehicle type and value
• Coverage level (liability, collision, comprehensive)
• Deductible amount
• Driver age and experience
• Location
• Usage patterns

Example: A 2015 Toyota Civic with comprehensive coverage typically costs between $300-450/month. Get your exact quote in under 5 minutes by entering your VIN.`,
    followUp: ['Get a quote', 'What coverage options are available?', 'Can I customize my coverage?']
  },

  {
    id: 'price-2',
    category: 'Pricing & Quotes',
    intents: ['get a quote', 'quote me', 'how to quote', 'quote process', 'free quote'],
    question: 'How do I get a quote?',
    answer: `Getting a quote from PolarGuard is simple:

1. Enter your 17-character VIN (Vehicle Identification Number)
2. Add your driver information
3. Choose your coverage level
4. Review your personalized quote
5. Our broker reviews your details within 24 hours
6. Activate immediately if approved

That's it! The entire process takes under 5 minutes. No hidden fees, no surprises. Your quote is valid for 30 days.

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
    intents: ['customize quote', 'adjust coverage', 'change deductible', 'lower premium'],
    question: 'Can I customize my insurance coverage and price?',
    answer: `Absolutely! You have full control over your coverage:

🎯 CHOOSE YOUR DEDUCTIBLE:
• $250 - Higher premium, less out-of-pocket
• $500 - Balanced option
• $1,000 - Lower premium, more out-of-pocket

📋 CHOOSE YOUR COVERAGE:
• Liability Only (basic legal requirement)
• Liability + Collision (protects your vehicle)
• Liability + Comprehensive (adds theft, weather protection)
• Full Coverage (liability + collision + comprehensive)

💡 TIPS TO LOWER YOUR PREMIUM:
1. Increase your deductible
2. Choose liability-only coverage (if vehicle is older)
3. Bundle multiple vehicles
4. Ask about discounts you may qualify for

Try different combinations in the quote tool!`,
    followUp: ['What does liability cover?', 'Should I get comprehensive?', 'What is a deductible?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 3: COVERAGE EXPLAINED
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'coverage-1',
    category: 'Coverage',
    intents: ['what coverage', 'coverage options', 'what is covered', 'coverage types'],
    question: 'What coverage options are available?',
    answer: `We offer three main coverage types:

1️⃣ LIABILITY COVERAGE (Required by law)
   • Covers injuries you cause to others
   • Covers damage to others' property
   • Cost: Starting at $40-60/month
   • Mandatory in Canada

2️⃣ COLLISION COVERAGE (Optional)
   • Covers damage to YOUR vehicle from accidents
   • Covers impact with other vehicles
   • Cost: $60-150/month
   • For financed or valuable vehicles

3️⃣ COMPREHENSIVE COVERAGE (Optional)
   • Covers non-collision damage (theft, weather, vandalism)
   • Includes protection from uninsured drivers
   • Cost: $30-80/month
   • Recommended for newer vehicles

💡 Most drivers choose Full Coverage for maximum protection.`,
    followUp: ['What should I choose?', 'What is a deductible?', 'Can I just get liability?']
  },

  {
    id: 'coverage-2',
    category: 'Coverage',
    intents: ['liability', 'liability coverage', 'what does liability cover'],
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
   • Minimum limits vary by province ($200,000 is standard)
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
   • Higher deductible = lower monthly premium
   • Common deductibles: $250, $500, $1,000

💡 EXAMPLE:
   You hit a pole and cause $4,000 damage. With $500 collision deductible:
   • Your insurance pays: $3,500
   • You pay: $500`,
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
   • Usually lower than collision
   • Same deductible choices: $250, $500, $1,000

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

EXAMPLE: You have a car accident
• Total damage: $5,000
• Your deductible: $500
• Your insurance pays: $4,500
• You pay: $500

🎯 DEDUCTIBLE OPTIONS:

$250 DEDUCTIBLE:
   ✓ Lowest out-of-pocket per claim
   ✓ Higher monthly premium
   ✓ Best if you think you might claim

$500 DEDUCTIBLE:
   ✓ Middle ground - most popular choice
   ✓ Moderate monthly premium
   ✓ Balanced protection and savings

$1,000 DEDUCTIBLE:
   ✓ Lowest monthly premium
   ✓ Highest out-of-pocket per claim
   ✓ Best if you're a careful driver

⚠️ IMPORTANT FACTS:
   • You choose your deductible when getting a quote
   • Deductible applies to EACH claim
   • Applies to collision AND comprehensive coverage separately

💭 WHICH SHOULD YOU CHOOSE?
   • Good driving record? Try $500-$1,000
   • New driver or worried? Go with $250
   • Budget-conscious? Use $1,000`,
    followUp: ['What deductible should I choose?', 'How much will I pay monthly?', 'Get a quote']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 4: ELIGIBILITY & REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'eligibility-1',
    category: 'Eligibility',
    intents: ['who can get coverage', 'am i eligible', 'can i qualify', 'requirements'],
    question: 'Who can get coverage from PolarGuard?',
    answer: `PolarGuard serves most Canadian drivers!

✅ YOU LIKELY QUALIFY IF:
   • You're 18+ years old with a valid driver's license
   • You live in Canada (any province/territory)
   • Your vehicle is registered in Canada
   • You have a valid VIN
   • You want short-term coverage (1-3 months)

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
    intents: ['how does it work', 'process', 'steps', 'how do i start'],
    question: 'How does the PolarGuard process work?',
    answer: `Getting insured with PolarGuard takes just 3 simple steps:

⏱️ TOTAL TIME: Under 5 minutes to quote, same-day activation

STEP 1️⃣: GET YOUR QUOTE (2-3 minutes)
   1. Enter your VIN
   2. Add your driver information
   3. Choose your coverage and deductible
   4. See your personalized quote
   5. Quote is valid for 30 days

STEP 2️⃣: BROKER REVIEW (within 24 hours)
   • Our licensed broker reviews your application
   • We verify your information
   • Usually approved same-day
   • Final price confirmed

STEP 3️⃣: ACTIVATE YOUR POLICY
   • Review final documents
   • Complete payment
   • Get your digital pink slip
   • Coverage becomes active immediately

📱 YOU'LL GET:
   ✓ Digital pink slip (proof of insurance)
   ✓ Policy documents (digital)
   ✓ Broker contact info
   ✓ Emergency roadside support (included)

🎯 KEY ADVANTAGES:
   ✓ No 24-48 hour wait - activate same-day
   ✓ No complex forms - just VIN and basic info
   ✓ No background checks
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
    answer: `Getting a quote requires minimal information:

🚗 VEHICLE INFORMATION:
   ✓ VIN (17-character code)
   ✓ License plate number (optional)
   ✓ Garage address or where car is parked

👤 DRIVER INFORMATION:
   ✓ Full legal name
   ✓ Date of birth
   ✓ Driver's license number
   ✓ Email address
   ✓ Phone number

🔒 SAFETY & HISTORY:
   ✓ Driving record disclosure
   ✓ Any accidents in last 3 years?
   ✓ Any traffic violations?
   ✓ Any insurance claims?
   ✓ Any policy cancellations?

📋 COVERAGE PREFERENCES:
   ✓ What coverage do you want?
   ✓ What deductible?
   ✓ Annual mileage estimate
   ✓ Primary use (commute, leisure)

⏱️ HOW LONG IT TAKES:
   • Gathering info: 2-3 minutes
   • Filling out form: 1-2 minutes
   • Getting quote: instant

Start your quote now - we make it simple!`,
    followUp: ['Get a quote', 'Where do I find my VIN?', 'What coverage should I choose?']
  },

  {
    id: 'process-4',
    category: 'Process',
    intents: ['how fast', 'how long', 'activation time', 'when can i drive', 'same day'],
    question: 'How quickly can I get coverage?',
    answer: `PolarGuard is built for speed. Here's the timeline:

⚡ THE FAST TRACK:

IMMEDIATE (Right now):
   • Get your quote online: 2-3 minutes
   • See your exact price instantly
   • Quote valid for 30 days

WITHIN 2-4 HOURS:
   • Broker reviews your application
   • Usually approved with no issues
   • You're notified by email/phone

SAME-DAY (usually):
   • Complete payment
   • Receive digital pink slip
   • Coverage is active
   • You can drive immediately!

✅ TYPICAL TIMELINE:
   • 2:00 PM: You submit application
   • 3:30 PM: Broker approves
   • 3:45 PM: You complete payment
   • 4:00 PM: Coverage is active
   • 4:05 PM: You're driving legally!

🎯 BOTTOM LINE:
   Most drivers are activated within 24 hours. Many within a few hours. Same-day is the goal!

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
   ☎️ PolarGuard Broker: 587-875-8875
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
    intents: ['not at fault claim', 'other driver fault', 'my insurance cost', 'other driver is at fault', 'other driver caused', 'not my fault', 'wasnt my fault', 'hit my car', 'somebody hit my car', 'someone hit my car', 'if the other driver'],
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
   • $250 deductible = You pay $250 per claim
   • $500 deductible = You pay $500 per claim
   • $1,000 deductible = You pay $1,000 per claim

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
    intents: ['term length', 'how long', 'policy length', 'coverage length', '3 month', 'how long is my policy', 'length of my policy', 'how long does my policy last', 'what happens after 3 months', 'how do i renew', 'renew my policy', 'renewal'],
    question: 'How long is my insurance policy?',
    answer: `PolarGuard offers flexible 3-month prepaid policies:

📅 POLICY LENGTH:
   Standard: 3 months (90 days)
   You can renew every 3 months
   No long-term commitment
   Easy to cancel if needed

🔄 RENEWAL OPTIONS:

CONTINUE WITH US:
   • Simply pay for another 3 months
   • Same coverage (if unchanged)
   • Takes 2 minutes online

SWITCH TO ANOTHER INSURER:
   • Cancel after 3 months (no penalty)
   • No early termination fees
   • Instant cancellation
   • No lock-in contract

✅ ADVANTAGES OF 3-MONTH POLICY:

   ✓ No 12-month commitment
   ✓ Easy to cancel
   ✓ Easy to switch coverage
   ✓ Easy to switch insurers
   ✓ Test drive us risk-free
   ✓ Perfect for temporary needs
   ✓ Rates reviewed every 3 months

📝 POLICY TIMELINE:

DAY 1: Coverage begins
DAYS 1-90: Your policy is active
DAY 90: Policy ends
DAY 90+: What's next?
   • RENEW: Pay for next 3 months
   • CANCEL: No cancellation fee
   • DO NOTHING: Coverage stops (becomes uninsured - illegal!)

⚠️ DON'T LET COVERAGE LAPSE:
   • Driving uninsured = illegal
   • Fines up to $50,000+
   • License suspension

Ready to get your 3-month policy started?`,
    followUp: ['Can I renew?', 'Can I cancel early?', 'What happens after 3 months?']
  },

  {
    id: 'policy-2',
    category: 'Policies',
    intents: ['cancel policy', 'early cancellation', 'termination', 'stop insurance', 'cancel anytime', 'cancel my policy', 'how do i cancel', 'can i cancel', 'cancel whenever', 'want to cancel'],
    question: 'Can I cancel my policy anytime?',
    answer: `Yes! PolarGuard policies have no early cancellation penalties:

✅ CANCELLATION FLEXIBILITY:

You can cancel:
   • After 1 month with no fee
   • After 2 months with no fee
   • After 3 months with no fee
   • Anytime - no penalties
   • No termination fees
   • No cancellation charges

🎯 HOW TO CANCEL:

OPTION 1 - PHONE:
   ☎️ Call our broker: 587-875-8875
   • Say you want to cancel
   • We process immediately
   • Confirmation emailed

OPTION 2 - EMAIL:
   📧 Email: support@polarguard.ca
   • Subject: "Cancel Policy [Your Policy #]"
   • Confirm 24-48 hour processing

💰 REFUNDS:

You get a prorated refund:
   Example:
   • 3-month policy cost: $1,200
   • Cancel after 1 month: Used $400
   • Refund: $800

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
    followUp: ['How much will my refund be?', 'Can I pause coverage?', 'What\'s your guarantee?']
  },

  {
    id: 'policy-3',
    category: 'Policies',
    intents: ['discount', 'how to get discount', 'save money', 'discount codes'],
    question: 'What discounts are available?',
    answer: `PolarGuard offers several ways to save:

💰 AVAILABLE DISCOUNTS:

GOOD DRIVER DISCOUNT:
   • 3+ years without accidents
   • Reduces premium 5-10%
   • Automatic when qualifying

VEHICLE SAFETY FEATURES:
   • Anti-theft devices
   • ABS brakes
   • Air bags
   • Electronic stability control
   • Reduces premium 5-15%

DEFENSIVE DRIVING COURSE:
   • Take approved course
   • Reduces premium 5-10%
   • Takes 4-8 hours

MULTI-VEHICLE BUNDLE:
   • 2+ vehicles insured
   • 10-15% discount per vehicle

LOW MILEAGE DISCOUNT:
   • Annual mileage <8,000 km
   • Premium reduced 5-10%

ANNUAL PAYMENT:
   • Pay 12 months upfront
   • 3-5% discount

🔄 HOW TO GET DISCOUNTS:

AUTOMATIC:
   • Good driver status
   • Safety features
   • Just qualify and you get it

MENTION IN QUOTE:
   • Tell us about features
   • Tell us about safety course
   • We apply if you qualify

📊 DISCOUNT EXAMPLES:

EXAMPLE 1: Good driver + vehicle bundle
   • Base rate: $120/month
   • Good driver discount: -$10
   • Multi-vehicle: -$15
   • Your rate: $95/month
   • Savings: $25/month ($300/year)

💡 BEST WAY TO SAVE:
   1. Maintain clean driving record
   2. Add vehicle safety features
   3. Take defensive driving course
   4. Bundle multiple vehicles
   5. Keep mileage low

Get your quote and see your savings!`,
    followUp: ['Get a quote', 'Do I qualify for any discounts?', 'What else can I do to save?']
  },

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY 8: SUPPORT & CONTACT
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'support-1',
    category: 'Support',
    intents: ['phone number', 'contact us', 'how to reach', 'support hours', 'customer service'],
    question: 'How do I contact PolarGuard support?',
    answer: `Multiple ways to reach our team:

☎️ PHONE (Fastest):
   Main Line: 587-875-8875
   Hours: Monday-Friday 9 AM - 6 PM MT
   Saturdays: 10 AM - 4 PM MT

📧 EMAIL:
   support@polarguard.ca
   Response time: 24-48 hours

💬 LIVE CHAT (Website):
   Available during business hours
   Fastest response time

📱 WhatsApp:
   +1 (587) 875-8875
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
    intents: ['general question', 'need help', 'lost', 'confused', 'where to start', 'where do i start', 'i have questions', 'where should i start'],
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
   2. Call our broker: 587-875-8875
   3. Visit our FAQ section

💳 IF YOU HAVE BILLING QUESTIONS:
   1. Check your email for invoice
   2. Call 587-875-8875
   3. Login to check payment history

🚗 IF YOU WERE IN AN ACCIDENT:
   1. Call immediately: 587-875-8875
   2. Have policy number ready
   3. 24/7 emergency line available

✓ IF YOU WANT TO RENEW:
   1. Call: 587-875-8875
   2. Online: Policy management portal
   3. Email: support@polarguard.ca

❌ IF YOU WANT TO CANCEL:
   1. Call: 587-875-8875
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

What would you like to know? Or call us directly: 587-875-8875`,
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
    answer: `No credit checks, no background checks.

✅ WHAT WE DON'T DO:
   • Credit checks or credit scores
   • Criminal background checks
   • Employment verification

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

Have a specific situation in mind? Ask me directly, or call our broker: 587-875-8875.`,
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

If you're not sure whether your vehicle qualifies, tell me the make and model — or call our broker: 587-875-8875.`,
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
   • Contact us proactively if you expect a payment issue: 587-875-8875

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
