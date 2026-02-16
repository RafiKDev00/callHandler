import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { saveCall, getCallerStats, getRecentCalls, getCallById, searchCalls } from './db.js';
import { analyzeTranscript } from './analyzer.js';
import { detectPatterns } from './patterns.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze a transcript
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // 1. Analyze transcript with OpenAI
    const analysis = await analyzeTranscript(transcript, apiKey);

    // 2. Check for patterns in call history
    const callerStats = getCallerStats(analysis.phone, analysis.name);
    const patterns = detectPatterns(analysis, callerStats);

    // 3. Save the call to database
    const callId = saveCall({
      transcript,
      ...analysis
    });

    // 4. Return combined result
    res.json({
      id: callId,
      ...analysis,
      patterns
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze transcript' });
  }
});

// Get call history
app.get('/api/calls', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const calls = getRecentCalls(limit);
    res.json(calls);
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// Get single call by ID
app.get('/api/calls/:id', (req, res) => {
  try {
    const call = getCallById(parseInt(req.params.id));
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.json(call);
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

// Search calls by name or phone
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const calls = searchCalls(query);
    res.json(calls);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search calls' });
  }
});

app.listen(PORT, () => {
  console.log(`CallHandler API running on http://localhost:${PORT}`);
});
