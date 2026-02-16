const API_BASE = 'http://localhost:3001/api';

export async function analyzeTranscript(transcript) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze transcript');
  }

  return response.json();
}

export async function getCallHistory(limit = 50) {
  const response = await fetch(`${API_BASE}/calls?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch call history');
  }

  return response.json();
}

export async function getCallById(id) {
  const response = await fetch(`${API_BASE}/calls/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch call');
  }

  return response.json();
}
