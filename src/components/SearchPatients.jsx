import { useState, useEffect, useRef } from 'react';
import './SearchPatients.css';

const API_BASE = 'http://localhost:3001/api';

function SearchPatients() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const searchRef = useRef(null);

  // Debounced autocomplete as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Group by unique patients for suggestions
        const uniquePatients = {};
        data.forEach(call => {
          const key = `${call.name || 'Unknown'}-${call.phone || ''}`;
          if (!uniquePatients[key]) {
            uniquePatients[key] = {
              name: call.name || 'Unknown',
              phone: call.phone,
              dob: call.dob,
              callCount: 0,
              calls: []
            };
          }
          uniquePatients[key].callCount++;
          uniquePatients[key].calls.push(call);
        });

        setSuggestions(Object.values(uniquePatients).slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Autocomplete failed:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setSelectedPatient(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectSuggestion = (patient) => {
    setQuery(patient.name);
    setShowSuggestions(false);
    setSelectedPatient(patient);
    setSearched(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatIntent = (intent) => {
    return intent
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  // Group results by patient (name + phone combo)
  const groupedResults = results.reduce((acc, call) => {
    const key = `${call.name || 'Unknown'}-${call.phone || 'No phone'}`;
    if (!acc[key]) {
      acc[key] = {
        name: call.name || 'Unknown',
        phone: call.phone,
        dob: call.dob,
        calls: []
      };
    }
    acc[key].calls.push(call);
    return acc;
  }, {});

  const patients = Object.values(groupedResults);

  return (
    <div className="search-patients">
      <div className="search-input-section" ref={searchRef}>
        <h2 className="section-title">Search Patients</h2>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or phone number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((patient, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(patient)}
                  >
                    <div className="suggestion-main">
                      <span className="suggestion-name">{patient.name}</span>
                      <span className="suggestion-calls">{patient.callCount} call(s)</span>
                    </div>
                    <div className="suggestion-sub">
                      {patient.phone && <span>{patient.phone}</span>}
                      {patient.dob && <span>DOB: {patient.dob}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn btn-primary search-btn"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="search-loading">
          <div className="spinner"></div>
          <span>Searching...</span>
        </div>
      )}

      {!loading && searched && patients.length === 0 && !selectedPatient && (
        <div className="no-results">
          <p>No patients found matching "{query}"</p>
        </div>
      )}

      {!loading && patients.length > 0 && !selectedPatient && (
        <div className="patients-list">
          <h3 className="results-count">{patients.length} patient(s) found</h3>
          {patients.map((patient, idx) => (
            <div
              key={idx}
              className="patient-card"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="patient-info">
                <span className="patient-name">{patient.name}</span>
                <span className="patient-phone">{patient.phone || 'No phone'}</span>
              </div>
              <div className="patient-meta">
                <span className="call-count">{patient.calls.length} call(s)</span>
                {patient.dob && <span className="patient-dob">DOB: {patient.dob}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <div className="patient-detail">
          <button
            className="back-btn"
            onClick={() => setSelectedPatient(null)}
          >
            ← Back to results
          </button>

          <div className="patient-header">
            <h3 className="patient-name-large">{selectedPatient.name}</h3>
            <div className="patient-details">
              {selectedPatient.phone && <span>Phone: {selectedPatient.phone}</span>}
              {selectedPatient.dob && <span>DOB: {selectedPatient.dob}</span>}
            </div>
          </div>

          <h4 className="calls-title">Call History ({selectedPatient.calls.length})</h4>

          <div className="calls-list">
            {selectedPatient.calls.map((call) => (
              <div key={call.id} className={`call-card urgency-border-${call.urgency}`}>
                <div className="call-header">
                  <span className={`call-urgency urgency-${call.urgency}`}>
                    {call.urgency}
                  </span>
                  <span className="call-date">{formatDate(call.created_at)}</span>
                </div>
                <div className="call-intent">{formatIntent(call.intent)}</div>
                <p className="call-summary">{call.summary}</p>
                <details className="call-transcript">
                  <summary>View transcript</summary>
                  <p>{call.transcript}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPatients;
