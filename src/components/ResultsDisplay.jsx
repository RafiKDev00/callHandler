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

            <div className="result-item">
              <span className="result-label">Summary</span>
              <span className="result-value">{result.summary || '—'}</span>
            </div>

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
