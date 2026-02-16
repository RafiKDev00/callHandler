import './PatternFlags.css';

function PatternFlags({ patterns }) {
  if (!patterns || !patterns.flags || patterns.flags.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '!!';
      case 'medium':
        return '!';
      default:
        return 'i';
    }
  };

  return (
    <div className="pattern-flags">
      <div className="flags-header">
        <span className="flags-icon">⚠</span>
        <span className="flags-title">Pattern Alerts</span>
        {patterns.hasHighPriorityFlags && (
          <span className="high-priority-badge">Action Required</span>
        )}
      </div>

      <div className="flags-list">
        {patterns.flags.map((flag, index) => (
          <div key={index} className={`flag-item flag-${flag.severity}`}>
            <span className="flag-severity">{getSeverityIcon(flag.severity)}</span>
            <div className="flag-content">
              <p className="flag-message">{flag.message}</p>
              {flag.details && flag.details.length > 0 && (
                <div className="flag-details">
                  {flag.details.slice(0, 3).map((detail, i) => (
                    <div key={i} className="detail-item">
                      <span className="detail-date">
                        {new Date(detail.date).toLocaleDateString()}
                      </span>
                      {detail.urgency && (
                        <span className={`detail-urgency urgency-${detail.urgency}`}>
                          {detail.urgency}
                        </span>
                      )}
                      <span className="detail-summary">{detail.summary}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {patterns.previousCallCount > 0 && (
        <div className="previous-calls-summary">
          <span>{patterns.previousCallCount} previous call(s) in last 72 hours</span>
        </div>
      )}
    </div>
  );
}

export default PatternFlags;
