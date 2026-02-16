import { useState, useEffect } from 'react';
import { getCallHistory } from '../services/api';
import './CallHistory.css';

function CallHistory({ onSelectCall, refreshTrigger }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCalls();
  }, [refreshTrigger]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await getCallHistory(30);
      setCalls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatIntent = (intent) => {
    return intent
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  if (loading) {
    return (
      <div className="history-section">
        <h2 className="section-title">Call History</h2>
        <div className="history-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-section">
        <h2 className="section-title">Call History</h2>
        <div className="history-error">{error}</div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="history-section">
        <h2 className="section-title">Call History</h2>
        <div className="history-empty">No calls recorded yet</div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h2 className="section-title">Call History ({calls.length})</h2>
      <div className="history-list">
        {calls.map((call) => (
          <div
            key={call.id}
            className={`history-item urgency-border-${call.urgency}`}
            onClick={() => onSelectCall && onSelectCall(call)}
          >
            <div className="history-item-header">
              <span className="history-name">{call.name || 'Unknown'}</span>
              <span className="history-time">{formatDate(call.created_at)}</span>
            </div>
            <div className="history-item-meta">
              <span className={`history-urgency urgency-${call.urgency}`}>
                {call.urgency}
              </span>
              <span className="history-intent">{formatIntent(call.intent)}</span>
            </div>
            <p className="history-summary">{call.summary}</p>
            <div className="history-item-footer">
              <span className="history-phone">{call.phone || '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CallHistory;
