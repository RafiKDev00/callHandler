import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a clinic phone assistant AI that analyzes phone call transcripts. Your job is to extract structured information from the transcript and identify the caller's intent and urgency level.

Extract the following information and return it as JSON:
- intent: The primary reason for the call. Must be one of: "appointment_booking", "appointment_cancellation", "prescription_refill", "billing_question", "test_results", "referral_request", "urgent_medical_issue", "insurance_inquiry", "medication_question", "general_inquiry"
- name: The caller's full name
- dob: Date of birth in ISO format (YYYY-MM-DD)
- phone: Callback phone number in format XXX-XXX-XXXX
- summary: A brief 1-2 sentence summary of the reason for the call
- urgency: Must be one of: "high", "medium", "low"

Urgency guidelines:
- HIGH: Life-threatening symptoms (chest pain, difficulty breathing, severe allergic reactions, high fever in children, stroke symptoms, severe bleeding)
- MEDIUM: Concerning symptoms that need attention soon (medication side effects, worsening conditions, fever)
- LOW: Routine matters (appointments, billing, refills, general questions)

Return ONLY valid JSON with these exact fields. Do not include any other text or explanation.`;

export async function analyzeTranscript(transcript, apiKey) {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this phone call transcript:\n\n"${transcript}"` }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}
