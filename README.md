# CallHandler - AI-Powered Clinic Phone Assistant

A mobile-first web application that analyzes phone call transcripts to extract structured patient information, identify urgency levels, and detect concerning patterns based on call history.

![Powered by ScribeMD](https://static.scribemd.ai/assets/prod/logo-b2c84ae1eb5833070341ede85b5c1f9bf2d8f5ca345b105d914f43a9a279242b.svg)

---

## How I Approached the Problem

### Step 1: Core Requirements
Started with the basic requirements from the prompt:
- Accept a phone call transcript (text input)
- Identify caller intent (appointment, prescription, billing, urgent issue)
- Extract structured data (name, DOB, phone, reason)
- Output clean JSON
- Flag urgency appropriately

### Step 2: Tech Stack Selection
Chose a modern, lightweight stack:
- **Frontend**: React + Vite (fast dev experience, mobile-first CSS)
- **Backend**: Express.js (simple API layer)
- **Database**: SQLite (zero config, persists call history)
- **AI**: OpenAI GPT-4o-mini (cost-effective, fast, reliable JSON output)

### Step 3: Beyond the Basics
After the core was working, I added features that would matter in a real clinic:

1. **Backend API** - Moved OpenAI calls server-side so API keys are never exposed to the browser
2. **Call History** - Persisted all analyzed calls in SQLite for future reference
3. **Patient Search** - Added a search tab with autocomplete to find patients by name or phone
4. **Pattern Detection** - The real value-add. The system now automatically flags:
   - Repeat callers (same person calling multiple times in 72 hours)
   - Escalating symptoms (previous calls were low urgency, now high)
   - Recurring issues (calling about the same problem repeatedly)
   - Rapid callbacks (3+ calls in 24 hours = something's wrong)

### Step 4: UX Polish
- Clean blue/white medical aesthetic
- Mobile-first responsive design
- Tabbed interface (Analyze / Search)
- Test transcript dropdown for easy demo
- Formatted view + raw JSON toggle

---

## AI Tools Used

### Claude Code (Anthropic) - Development Assistant
Used Claude Code CLI throughout the entire development process:
- **Project scaffolding**: Generated the initial Vite + React structure
- **Component creation**: Wrote all React components (Header, ResultsDisplay, PatternFlags, CallHistory, SearchPatients)
- **Backend logic**: Created Express server, SQLite database schema, and API routes
- **Pattern detection algorithm**: Designed and implemented the logic for flagging concerning call patterns
- **CSS styling**: Mobile-first responsive styles
- **README writing**: This document

Claude Code was particularly valuable for:
- Rapid iteration (edit → test → refine cycle)
- Maintaining consistency across files
- Catching edge cases in the pattern detection logic

### OpenAI GPT-4o-mini - Production AI
Powers the actual transcript analysis in the app:
- **Intent classification**: Categorizes calls into 10 intent types
- **Entity extraction**: Pulls out name, DOB, phone number
- **Summarization**: Creates a brief summary of the call reason
- **Urgency assessment**: Classifies as high/medium/low based on medical guidelines
- **Clinical terminology**: Generates possible clinical assessments using proper medical terminology (hidden by default, toggle to view)
- **Medication detection**: Recognizes medications mentioned in calls including:
  - Generic names (lisinopril, metformin)
  - Brand names (Lipitor, Tylenol, EpiPen)
  - Slang/common names ("water pill" → hydrochlorothiazide, "blood thinner" → anticoagulant)
  - Returns normalized name, what caller said, and drug category
- **Provider/Department routing**: Identifies specific doctors or departments requested by callers (e.g., "Dr. Smith", "Billing", "Cardiology") for efficient call routing
- **Insurance detection**: Captures insurance information when mentioned:
  - Whether caller has insurance (yes/no)
  - Plan type if specified (Blue Cross, Aetna PPO, Medicare, etc.)
  - Returns null if insurance not mentioned at all
- **Known allergies**: Extracts confirmed allergies the patient mentions (e.g., "I'm allergic to penicillin", "peanut allergy")
  - Only captures stated allergies, not symptoms of reactions
  - Displayed prominently with red warning styling for safety
- **Social Determinants of Health (SDOH)**: Captures social factors affecting healthcare:
  - Transportation (no car, relies on family, public transit)
  - Living situation (lives alone, with family, nursing home)
  - Caregiver availability
  - Language barriers and interpreter needs
  - Vulnerable population flags (elderly alone, cognitive impairment, financial hardship)
- **Scheduling Context**: For appointment-related calls:
  - Appointment type needed (same-day urgent, routine, follow-up)
  - Scheduling constraints (works weekdays, transportation dependent)
  - Visit type preference (in-person, telehealth)
  - Existing appointment status
- **Billing/Admin Context**: For administrative calls:
  - Issue type (billing dispute, insurance claim, payment question)
  - Dispute details with amounts
  - Administrative requests (medical records, work excuse, disability paperwork)
- **Mental Health Indicators**: Sensitive detection of mental health concerns:
  - Concerns mentioned (anxiety, depression, panic attacks, substance use, etc.)
  - Severity indicators (crisis, urgent, routine)
  - Caller emotional state (distressed, crying, agitated)
  - Current treatment status
  - **CRISIS ALERT**: Auto-flags suicidal ideation or self-harm mentions
- **Pregnancy Information**: OB-specific extraction:
  - Pregnancy status, trimester, weeks if mentioned
  - Concerns (bleeding, contractions, reduced movement)
  - High-risk pregnancy flag
- **Infectious Disease Context**: COVID/illness tracking:
  - Disease type (COVID, flu, strep, RSV, stomach virus)
  - Symptoms mentioned
  - Exposure status, test requests, isolation guidance
  - Household members affected
- **Alternate Contacts**: Additional ways to reach caller:
  - Secondary phone numbers
  - Email addresses
  - Emergency contacts (name, relationship, phone)
  - Preferred contact method (call, text, email)
  - Best time to call
  - Pharmacy information
- **Extraction Confidence Score**: Smart completeness evaluation:
  - Score 0-100 based on topic-relevant fields captured
  - Identifies primary topic (medical, scheduling, billing, prescription)
  - Lists expected vs captured vs missing fields
  - Data quality notes for unclear/ambiguous information

Configuration:
- `temperature: 0.1` for consistent, deterministic outputs
- `response_format: { type: 'json_object' }` for reliable JSON
- All 18 fields always returned in JSON (null/empty if not applicable)
- Detailed system prompt with urgency classification guidelines

### Complete JSON Schema
Every analysis returns ALL fields for consistency:
```json
{
  "intent": "appointment_booking | prescription_refill | billing_question | ...",
  "name": "string | null",
  "dob": "YYYY-MM-DD | null",
  "phone": "XXX-XXX-XXXX | null",
  "requested_provider": { "type": "doctor|department|both", "doctors": [], "department": "" } | null,
  "insurance": { "has_insurance": true|false, "plan_type": "" } | null,
  "summary": "string",
  "possible_clinical_terms": "string | null",
  "medications_mentioned": [{ "name": "", "mentioned_as": "", "category": "" }],
  "known_allergies": ["string"],
  "sdoh": { "transportation": "", "living_situation": "", "caregiver_available": "", "language_barrier": {}, "vulnerable_population_flags": [] } | null,
  "scheduling_context": { "appointment_type_needed": "", "scheduling_constraints": [], "visit_type_preference": "", "existing_appointment": {} } | null,
  "billing_context": { "issue_type": "", "dispute_details": {}, "administrative_requests": [] } | null,
  "mental_health": { "concerns_mentioned": [], "severity_indicators": "", "caller_emotional_state": "", "support_system_mentioned": null, "current_treatment": null } | null,
  "pregnancy": { "is_pregnant": true|false, "trimester": "", "weeks_if_mentioned": null, "concerns": [], "high_risk_mentioned": false } | null,
  "infectious_disease": { "type": "", "symptoms": [], "exposure_reported": false, "test_requested": false, "isolation_status": "", "household_affected": false } | null,
  "alternate_contacts": { "secondary_phone": "", "email": "", "emergency_contact": {}, "preferred_contact_method": "", "best_time_to_call": "", "pharmacy": {} } | null,
  "urgency": "high | medium | low",
  "extraction_confidence": { "score": 0-100, "primary_topic": "", "fields_expected": [], "fields_captured": [], "fields_missing": [], "data_quality_notes": [] }
}
```

---

## What I Would Improve With More Time

### High Priority
1. **Authentication** - Add clinic staff login (OAuth or simple JWT)
2. **Search Filters** - Filter history by date range, urgency level, intent type
3. **Real-time Audio** - Integrate Whisper API for live call transcription instead of pasting text
4. **Confidence Scores** - Have the AI return confidence levels for each extracted field

### Medium Priority
5. **EHR Integration** - Connect to Epic/Cerner to auto-link patients by DOB/name
6. **Multi-language** - Spanish support (critical for many US clinics)
7. **Batch Processing** - Upload a CSV of transcripts for bulk analysis
8. **Webhooks** - Notify external systems when high-urgency calls come in

### Nice to Have
9. **Analytics Dashboard** - Call volume trends, common intents, peak hours
10. **Unit/E2E Tests** - Jest + Playwright for reliability
11. **Docker** - Containerize for easy deployment
12. **Rate Limiting** - Protect the API from abuse

---

## Demo

### Example Input
```
"Hi, this is Sarah Cohen, born 03/12/1988. I need to book an appointment
because I've had chest pain for two days. Please call me back at 310-555-2211."
```

### Example Output
```json
{
  "id": 1,
  "intent": "urgent_medical_issue",
  "name": "Sarah Cohen",
  "dob": "1988-03-12",
  "phone": "310-555-2211",
  "requested_provider": null,
  "summary": "Chest pain for two days",
  "urgency": "high",
  "possible_clinical_terms": "Possible angina pectoris with 48hr duration. Recommend urgent cardiac evaluation to r/o ACS, MI.",
  "medications_mentioned": [],
  "patterns": {
    "flags": [],
    "hasHighPriorityFlags": false,
    "previousCallCount": 0
  }
}
```

### Example with Medications
```
"Hi there, this is Jennifer Martinez calling. My birthday is 07/22/1992.
I need to refill my blood pressure medication, Lisinopril 10mg.
My pharmacy is CVS on Main Street. Please call me back at 213-555-9901."
```

```json
{
  "intent": "prescription_refill",
  "name": "Jennifer Martinez",
  "dob": "1992-07-22",
  "phone": "213-555-9901",
  "summary": "Requesting refill of blood pressure medication",
  "urgency": "low",
  "medications_mentioned": [
    {
      "name": "lisinopril",
      "mentioned_as": "Lisinopril 10mg",
      "category": "ACE inhibitor"
    }
  ]
}
```

### Example with Provider/Department
```
"Good morning, my name is Patricia Brown, date of birth August 8, 1961.
Dr. Smith recommended I see a cardiologist and I need a referral.
Can you please process that and send it to my insurance? You can reach me at 714-555-3320."
```

```json
{
  "intent": "referral_request",
  "name": "Patricia Brown",
  "dob": "1961-08-08",
  "phone": "714-555-3320",
  "requested_provider": {
    "type": "both",
    "doctors": ["Dr. Smith"],
    "department": "Cardiology"
  },
  "summary": "Needs cardiology referral as recommended by Dr. Smith",
  "urgency": "low"
}
```

### Example with Insurance
```
"Hello, I'm calling to verify that you accept my new insurance plan.
My name is Emily Davis, born 06/10/1995. I just switched to Blue Shield PPO
and want to make sure I can still see Dr. Johnson. Call me at 323-555-1178."
```

```json
{
  "intent": "insurance_inquiry",
  "name": "Emily Davis",
  "dob": "1995-06-10",
  "phone": "323-555-1178",
  "requested_provider": {
    "type": "doctor",
    "doctors": ["Dr. Johnson"],
    "department": null
  },
  "insurance": {
    "has_insurance": true,
    "plan_type": "Blue Shield PPO"
  },
  "summary": "Verifying if clinic accepts new Blue Shield PPO insurance",
  "urgency": "low"
}
```

### Example with Known Allergies
```
"Hi, this is James Anderson, born 02/14/1979. My son just ate something with
peanuts and his face is swelling up. He has a peanut allergy. We gave him his
EpiPen but I need to know if we should come to the ER. Call back at 562-555-8891."
```

```json
{
  "intent": "urgent_medical_issue",
  "name": "James Anderson",
  "dob": "1979-02-14",
  "phone": "562-555-8891",
  "summary": "Child having allergic reaction to peanuts, EpiPen administered, asking if ER needed",
  "urgency": "high",
  "known_allergies": ["peanuts"],
  "medications_mentioned": [
    {"name": "epinephrine auto-injector", "mentioned_as": "EpiPen", "category": "emergency allergy medication"}
  ]
}
```

### Example with SDOH & Confidence Score
From test transcript #17 (Frantic Parent - ESL):
```json
{
  "intent": "urgent_medical_issue",
  "name": "José Ramirez",
  "urgency": "high",
  "sdoh": {
    "transportation": "no_car",
    "living_situation": "lives_with_family",
    "language_barrier": {
      "primary_language": "Spanish",
      "interpreter_needed": true,
      "health_literacy_concern": false
    },
    "vulnerable_population_flags": ["financial_hardship"]
  },
  "extraction_confidence": {
    "score": 72,
    "primary_topic": "medical",
    "fields_expected": ["name", "dob", "phone", "summary", "urgency"],
    "fields_captured": ["name", "phone", "summary", "urgency"],
    "fields_missing": ["dob"],
    "data_quality_notes": ["caller confused about children's names", "phone number given twice with different numbers"]
  }
}
```

### Example: Routine Caller (Positive Flag)
If a patient like Jennifer Martinez (from the medication example) calls multiple times for routine matters:
```json
{
  "patterns": {
    "flags": [
      {
        "type": "routine_caller",
        "severity": "info",
        "message": "Established patient with 3 routine calls",
        "details": {
          "totalCalls": 3,
          "intents": ["Prescription Refill", "Appointment Booking"],
          "allLowUrgency": true
        }
      }
    ],
    "hasHighPriorityFlags": false,
    "isRoutineCaller": true
  }
}
```

This displays as a green "Established patient" badge instead of a warning.

If Sarah calls again, the system flags it:
```json
{
  "patterns": {
    "flags": [
      {
        "type": "repeat_caller",
        "severity": "medium",
        "message": "Caller has made 1 call(s) in the last 72 hours"
      },
      {
        "type": "repeat_urgent",
        "severity": "high",
        "message": "Multiple urgent calls from this caller (2 total)"
      }
    ],
    "hasHighPriorityFlags": true,
    "previousCallCount": 1
  }
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd callhandler

# Install dependencies
npm install

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start both server and frontend
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Usage
1. **Analyze Tab**: Select a test transcript or paste your own, click "Analyze"
2. **Search Tab**: Search patients by name or phone number with autocomplete
3. View results with urgency badges and pattern alerts
4. Check call history at the bottom of the Analyze tab

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────┐          │
│  │  Header  │ │ PatternFlags │ │ SearchPatients │          │
│  └──────────┘ └──────────────┘ └────────────────┘          │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │   api.js client   │                         │
│              └─────────┬─────────┘                         │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────────┐
│                   Express Backend                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  analyzer.js │ │  patterns.js │ │    db.js     │        │
│  │  (OpenAI)    │ │  (detection) │ │  (SQLite)    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Detection Logic

| Pattern | Trigger | Severity |
|---------|---------|----------|
| Repeat Caller | Same phone/name in 72h | Medium (1-2), High (3+) |
| Repeat Urgent | Multiple high-urgency calls | High |
| Recurring Issue | Same intent 2+ times | Medium (2x), High (3x+) |
| Rapid Callbacks | 3+ calls in 24h | High |
| Escalating Symptoms | Low/medium → high urgency | High |
| **Routine Caller** | All calls low urgency + routine intents | Info (positive) |

#### Routine Caller Detection
The system identifies "established patients" who consistently call for routine matters. This positive flag appears when:
- Current call is low urgency with a routine intent
- All previous calls were also low urgency with routine intents
- No concerning patterns (repeat urgent, escalating symptoms, etc.)

**Routine intents:** appointment booking/cancellation, prescription refills, billing questions, test results, insurance inquiries, referral requests, general inquiries

This helps staff quickly identify low-risk callers who can be handled efficiently.

### Test Transcript Coverage

The 32 included test transcripts cover a wide range of scenarios:

| Category | Test Cases |
|----------|------------|
| **Urgent Medical** | #1 Chest Pain, #5 Breathing, #8 Allergic Reaction, #12 Child Fever, #15 Unconscious |
| **Routine** | #2 Physical, #3 Rx Refill, #6 Test Results, #7 Cancellation, #9 Referral |
| **Billing/Admin** | #4 Billing Dispute, #11 Insurance Verification |
| **Complex Callers** | #16 Elderly Confused, #17 ESL Parent, #18 Garbled Audio, #19 Rambling |
| **Mental Health** | #21 Anxiety/Depression, #22 Suicidal Ideation (CRISIS), #27 Postpartum, #32 Teen Self-Harm |
| **Pregnancy** | #23 Third Trimester Reduced Movement, #24 First Trimester Bleeding |
| **Infectious Disease** | #25 COVID Positive, #26 Family Flu Outbreak, #29 Strep Exposure |
| **SDOH/Vulnerable** | #16 Elderly Alone, #17 No Car/ESL, #30 Elderly Med Management, #31 Domestic Violence |
| **Alternate Contacts** | #28 Complex Scheduling, #30 Multiple Contacts, #23/#24 Spouse Contacts |

---

## Project Structure

```
callhandler/
├── server/
│   ├── index.js          # Express server & API routes
│   ├── db.js             # SQLite database setup & queries
│   ├── analyzer.js       # OpenAI transcript analysis
│   └── patterns.js       # Pattern detection algorithm
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Blue header with cross logo
│   │   ├── PatternFlags.jsx    # Alert banners for detected patterns
│   │   ├── ResultsDisplay.jsx  # Formatted/JSON results view
│   │   ├── CallHistory.jsx     # Historical calls list
│   │   └── SearchPatients.jsx  # Patient search with autocomplete
│   ├── data/
│   │   └── testTranscripts.js  # 32 test cases
│   ├── services/
│   │   └── api.js              # Backend API client
│   ├── App.jsx                 # Main app with tab navigation
│   ├── App.css                 # Component styles
│   └── index.css               # Global styles & variables
├── .env                  # API keys (git-ignored)
├── .env.example          # Template for .env
└── package.json
```

---

## API Endpoints

### POST /api/analyze
Analyze a transcript and save to history.

### GET /api/calls
Get call history. Query: `?limit=50`

### GET /api/search
Search by name or phone. Query: `?q=sarah`

---

## License

MIT
