import { useState } from 'react';

function ResultsDisplay({ result, loading, error }) {
  const [viewMode, setViewMode] = useState('formatted');
  const [showClinicalTerms, setShowClinicalTerms] = useState(false);

  if (loading) {
    return (
      <div className="results-section">
        <div className="results-card">
          <div className="loading">
            <div className="spinner"></div>
            <span>Analyzing transcript...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-section">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-section">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">
            Enter a transcript above and click "Analyze" to extract caller information
          </p>
        </div>
      </div>
    );
  }

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'urgency-high';
      case 'medium':
        return 'urgency-medium';
      default:
        return 'urgency-low';
    }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'critical';
  };

  return (
    <div className="results-section">
      <div className="results-card">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'formatted' ? 'active' : ''}`}
            onClick={() => setViewMode('formatted')}
          >
            Formatted
          </button>
          <button
            className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
            onClick={() => setViewMode('json')}
          >
            JSON
          </button>
        </div>

        {viewMode === 'formatted' ? (
          <>
            <div className="results-header">
              <span className="results-title">Extracted Data</span>
              {result.urgency && (
                <span className={`urgency-badge ${getUrgencyClass(result.urgency)}`}>
                  {result.urgency} Priority
                </span>
              )}
            </div>

            <div className="result-item">
              <span className="result-label">Intent</span>
              <span className="result-value">{result.intent || '—'}</span>
            </div>

            <div className="result-item">
              <span className="result-label">Name</span>
              <span className="result-value">{result.name || '—'}</span>
            </div>

            <div className="result-item">
              <span className="result-label">Date of Birth</span>
              <span className="result-value">{result.dob || '—'}</span>
            </div>

            <div className="result-item">
              <span className="result-label">Phone</span>
              <span className="result-value">{result.phone || '—'}</span>
            </div>

            {result.requested_provider && (
              <div className="result-item">
                <span className="result-label">Requested</span>
                <span className="result-value">
                  {result.requested_provider.doctors?.length > 0 && (
                    <span className="provider-doctors">
                      {result.requested_provider.doctors.join(', ')}
                    </span>
                  )}
                  {result.requested_provider.doctors?.length > 0 && result.requested_provider.department && (
                    <span className="provider-separator"> · </span>
                  )}
                  {result.requested_provider.department && (
                    <span className="provider-dept">{result.requested_provider.department}</span>
                  )}
                </span>
              </div>
            )}

            {result.insurance && (
              <div className="result-item">
                <span className="result-label">Insurance</span>
                <span className="result-value">
                  {result.insurance.has_insurance ? (
                    <>
                      <span className="insurance-yes">Yes</span>
                      {result.insurance.plan_type && (
                        <span className="insurance-plan"> — {result.insurance.plan_type}</span>
                      )}
                    </>
                  ) : (
                    <span className="insurance-no">No</span>
                  )}
                </span>
              </div>
            )}

            <div className="result-item">
              <span className="result-label">Summary</span>
              <span className="result-value">{result.summary || '—'}</span>
            </div>

            {result.medications_mentioned && result.medications_mentioned.length > 0 && (
              <div className="medications-section">
                <div className="result-item">
                  <span className="result-label">Medications</span>
                  <span className="result-value">
                    <div className="medication-list">
                      {result.medications_mentioned.map((med, index) => (
                        <div key={index} className="medication-item">
                          <span className="med-name">{med.name}</span>
                          {med.mentioned_as !== med.name && (
                            <span className="med-mentioned"> (mentioned as "{med.mentioned_as}")</span>
                          )}
                          {med.category && (
                            <span className="med-category"> — {med.category}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </span>
                </div>
              </div>
            )}

            {result.known_allergies && result.known_allergies.length > 0 && (
              <div className="result-item allergies-item">
                <span className="result-label">Allergies</span>
                <span className="result-value">
                  <div className="allergies-list">
                    {result.known_allergies.map((allergy, index) => (
                      <span key={index} className="allergy-tag">{allergy}</span>
                    ))}
                  </div>
                </span>
              </div>
            )}

            {result.possible_clinical_terms && (
              <div className="clinical-terms-section">
                <button
                  className="clinical-toggle"
                  onClick={() => setShowClinicalTerms(!showClinicalTerms)}
                >
                  {showClinicalTerms ? 'Hide' : 'Show'} Clinical Terms
                </button>
                {showClinicalTerms && (
                  <div className="result-item clinical-note">
                    <span className="result-label">Clinical Terms</span>
                    <span className="result-value">{result.possible_clinical_terms}</span>
                  </div>
                )}
              </div>
            )}

            {/* SDOH Section */}
            {result.sdoh && (
              <div className="context-section sdoh-section">
                <div className="section-header">Social Determinants</div>
                {result.sdoh.transportation && (
                  <div className="context-item">
                    <span className="context-label">Transportation</span>
                    <span className="context-value">{result.sdoh.transportation.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {result.sdoh.living_situation && (
                  <div className="context-item">
                    <span className="context-label">Living Situation</span>
                    <span className="context-value">{result.sdoh.living_situation.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {result.sdoh.caregiver_available !== null && result.sdoh.caregiver_available !== undefined && (
                  <div className="context-item">
                    <span className="context-label">Caregiver</span>
                    <span className="context-value">
                      {result.sdoh.caregiver_available === true ? 'Yes' :
                       result.sdoh.caregiver_available === false ? 'No' :
                       result.sdoh.caregiver_available}
                    </span>
                  </div>
                )}
                {result.sdoh.language_barrier && (
                  <div className="context-item">
                    <span className="context-label">Language</span>
                    <span className="context-value">
                      {result.sdoh.language_barrier.primary_language}
                      {result.sdoh.language_barrier.interpreter_needed && <span className="flag-tag">Interpreter needed</span>}
                    </span>
                  </div>
                )}
                {result.sdoh.vulnerable_population_flags?.length > 0 && (
                  <div className="context-item vulnerable-flags">
                    <span className="context-label">Flags</span>
                    <span className="context-value">
                      {result.sdoh.vulnerable_population_flags.map((flag, i) => (
                        <span key={i} className="vuln-flag">{flag.replace(/_/g, ' ')}</span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Scheduling Context */}
            {result.scheduling_context && (
              <div className="context-section scheduling-section">
                <div className="section-header">Scheduling</div>
                {result.scheduling_context.appointment_type_needed && (
                  <div className="context-item">
                    <span className="context-label">Type Needed</span>
                    <span className="context-value">{result.scheduling_context.appointment_type_needed.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {result.scheduling_context.visit_type_preference && (
                  <div className="context-item">
                    <span className="context-label">Visit Type</span>
                    <span className="context-value">{result.scheduling_context.visit_type_preference.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {result.scheduling_context.scheduling_constraints?.length > 0 && (
                  <div className="context-item">
                    <span className="context-label">Constraints</span>
                    <span className="context-value">
                      {result.scheduling_context.scheduling_constraints.map((c, i) => (
                        <span key={i} className="constraint-tag">{c.replace(/_/g, ' ')}</span>
                      ))}
                    </span>
                  </div>
                )}
                {result.scheduling_context.existing_appointment && (
                  <div className="context-item">
                    <span className="context-label">Existing Appt</span>
                    <span className="context-value">
                      {result.scheduling_context.existing_appointment.status?.replace(/_/g, ' ')}
                      {result.scheduling_context.existing_appointment.details && ` — ${result.scheduling_context.existing_appointment.details}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Billing Context */}
            {result.billing_context && (
              <div className="context-section billing-section">
                <div className="section-header">Billing/Admin</div>
                {result.billing_context.issue_type && (
                  <div className="context-item">
                    <span className="context-label">Issue Type</span>
                    <span className="context-value">{result.billing_context.issue_type.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {result.billing_context.dispute_details && (
                  <div className="context-item">
                    <span className="context-label">Dispute</span>
                    <span className="context-value">
                      {result.billing_context.dispute_details.amount && <strong>{result.billing_context.dispute_details.amount}</strong>}
                      {result.billing_context.dispute_details.reason && ` — ${result.billing_context.dispute_details.reason}`}
                    </span>
                  </div>
                )}
                {result.billing_context.administrative_requests?.length > 0 && (
                  <div className="context-item">
                    <span className="context-label">Requests</span>
                    <span className="context-value">
                      {result.billing_context.administrative_requests.map((r, i) => (
                        <span key={i} className="admin-tag">{r.replace(/_/g, ' ')}</span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mental Health */}
            {result.mental_health && (
              <div className={`context-section mental-health-section ${result.mental_health.severity_indicators === 'crisis' ? 'crisis-alert' : ''}`}>
                <div className="section-header">
                  Mental Health
                  {result.mental_health.severity_indicators === 'crisis' && (
                    <span className="crisis-badge">CRISIS</span>
                  )}
                </div>
                {result.mental_health.concerns_mentioned?.length > 0 && (
                  <div className="context-item">
                    <span className="context-label">Concerns</span>
                    <span className="context-value">
                      {result.mental_health.concerns_mentioned.map((c, i) => (
                        <span key={i} className={`mh-tag ${c === 'suicidal_ideation' || c === 'self_harm' ? 'mh-critical' : ''}`}>
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
                {result.mental_health.caller_emotional_state && (
                  <div className="context-item">
                    <span className="context-label">Emotional State</span>
                    <span className="context-value">{result.mental_health.caller_emotional_state}</span>
                  </div>
                )}
                {result.mental_health.current_treatment !== null && (
                  <div className="context-item">
                    <span className="context-label">In Treatment</span>
                    <span className="context-value">{result.mental_health.current_treatment ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Pregnancy */}
            {result.pregnancy && (
              <div className={`context-section pregnancy-section ${result.pregnancy.high_risk_mentioned ? 'high-risk' : ''}`}>
                <div className="section-header">
                  Pregnancy
                  {result.pregnancy.high_risk_mentioned && <span className="high-risk-badge">High Risk</span>}
                </div>
                {result.pregnancy.trimester && (
                  <div className="context-item">
                    <span className="context-label">Trimester</span>
                    <span className="context-value">
                      {result.pregnancy.trimester}
                      {result.pregnancy.weeks_if_mentioned && ` (${result.pregnancy.weeks_if_mentioned} weeks)`}
                    </span>
                  </div>
                )}
                {result.pregnancy.concerns?.length > 0 && (
                  <div className="context-item">
                    <span className="context-label">Concerns</span>
                    <span className="context-value">
                      {result.pregnancy.concerns.map((c, i) => (
                        <span key={i} className={`preg-tag ${['bleeding', 'contractions', 'reduced_movement'].includes(c) ? 'preg-urgent' : ''}`}>
                          {c.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Infectious Disease */}
            {result.infectious_disease && (
              <div className="context-section infectious-section">
                <div className="section-header">
                  Infectious Disease
                  {result.infectious_disease.type && (
                    <span className="disease-type">{result.infectious_disease.type.toUpperCase()}</span>
                  )}
                </div>
                {result.infectious_disease.symptoms?.length > 0 && (
                  <div className="context-item">
                    <span className="context-label">Symptoms</span>
                    <span className="context-value">{result.infectious_disease.symptoms.join(', ')}</span>
                  </div>
                )}
                <div className="context-item">
                  <span className="context-label">Status</span>
                  <span className="context-value">
                    {result.infectious_disease.exposure_reported && <span className="inf-tag">Exposure reported</span>}
                    {result.infectious_disease.test_requested && <span className="inf-tag">Test requested</span>}
                    {result.infectious_disease.household_affected && <span className="inf-tag">Household affected</span>}
                    {result.infectious_disease.isolation_status && (
                      <span className="inf-tag">{result.infectious_disease.isolation_status.replace(/_/g, ' ')}</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Alternate Contacts */}
            {result.alternate_contacts && (
              <div className="context-section contacts-section">
                <div className="section-header">Alternate Contacts</div>
                {result.alternate_contacts.secondary_phone && (
                  <div className="context-item">
                    <span className="context-label">Secondary #</span>
                    <span className="context-value">{result.alternate_contacts.secondary_phone}</span>
                  </div>
                )}
                {result.alternate_contacts.email && (
                  <div className="context-item">
                    <span className="context-label">Email</span>
                    <span className="context-value">{result.alternate_contacts.email}</span>
                  </div>
                )}
                {result.alternate_contacts.emergency_contact && (
                  <div className="context-item">
                    <span className="context-label">Emergency</span>
                    <span className="context-value">
                      <strong>{result.alternate_contacts.emergency_contact.name}</strong>
                      {result.alternate_contacts.emergency_contact.relationship && ` (${result.alternate_contacts.emergency_contact.relationship})`}
                      {result.alternate_contacts.emergency_contact.phone && ` — ${result.alternate_contacts.emergency_contact.phone}`}
                    </span>
                  </div>
                )}
                {result.alternate_contacts.preferred_contact_method && (
                  <div className="context-item">
                    <span className="context-label">Preferred</span>
                    <span className="context-value">{result.alternate_contacts.preferred_contact_method}</span>
                  </div>
                )}
                {result.alternate_contacts.best_time_to_call && (
                  <div className="context-item">
                    <span className="context-label">Best Time</span>
                    <span className="context-value">{result.alternate_contacts.best_time_to_call}</span>
                  </div>
                )}
                {result.alternate_contacts.pharmacy && (
                  <div className="context-item">
                    <span className="context-label">Pharmacy</span>
                    <span className="context-value">
                      {result.alternate_contacts.pharmacy.name}
                      {result.alternate_contacts.pharmacy.phone && ` — ${result.alternate_contacts.pharmacy.phone}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Confidence Score */}
            {result.extraction_confidence && (
              <div className={`confidence-section confidence-${getConfidenceLevel(result.extraction_confidence.score)}`}>
                <div className="confidence-header">
                  <span className="confidence-label">Extraction Confidence</span>
                  <span className="confidence-score">{result.extraction_confidence.score}%</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${result.extraction_confidence.score}%` }}></div>
                </div>
                <div className="confidence-details">
                  <span className="confidence-topic">Topic: {result.extraction_confidence.primary_topic}</span>
                  {result.extraction_confidence.fields_missing?.length > 0 && (
                    <div className="confidence-missing">
                      <span>Missing: </span>
                      {result.extraction_confidence.fields_missing.join(', ')}
                    </div>
                  )}
                  {result.extraction_confidence.data_quality_notes?.length > 0 && (
                    <div className="confidence-notes">
                      {result.extraction_confidence.data_quality_notes.map((note, i) => (
                        <span key={i} className="quality-note">{note}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <pre className="json-view">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
