import { useState } from 'react';
import Header from './components/Header';
import ResultsDisplay from './components/ResultsDisplay';
import PatternFlags from './components/PatternFlags';
import CallHistory from './components/CallHistory';
import SearchPatients from './components/SearchPatients';
import { testTranscripts } from './data/testTranscripts';
import { analyzeTranscript } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleTestSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    if (selectedId) {
      const selected = testTranscripts.find(t => t.id === selectedId);
      if (selected) {
        setTranscript(selected.transcript);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeTranscript(transcript);
      setResult(data);
      setRefreshHistory(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setResult(null);
    setError(null);
  };

  const handleSelectHistoryCall = (call) => {
    setResult({
      ...call,
      patterns: null
    });
  };

  return (
    <div className="app">
      <Header />

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          Analyze
        </button>
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search Patients
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'analyze' && (
          <>
            <div className="test-section">
              <h2 className="section-title">Load Test Transcript</h2>
              <select className="test-select" onChange={handleTestSelect} defaultValue="">
                <option value="">Select a test transcript...</option>
                {testTranscripts.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="input-section">
              <h2 className="section-title">Phone Transcript</h2>
              <textarea
                className="transcript-input"
                placeholder="Enter the phone call transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <div className="button-row">
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading || !transcript.trim()}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
                <button className="btn btn-secondary" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {result?.patterns && (
              <PatternFlags patterns={result.patterns} />
            )}

            <ResultsDisplay result={result} loading={loading} error={null} />

            <CallHistory
              onSelectCall={handleSelectHistoryCall}
              refreshTrigger={refreshHistory}
            />
          </>
        )}

        {activeTab === 'search' && (
          <SearchPatients />
        )}
      </main>
    </div>
  );
}

export default App;
