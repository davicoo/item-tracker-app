const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const DATA_DIR = '/tmp';
const DATA_FILE = path.join(DATA_DIR, 'notes-data.json');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function sanitizeNote(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }
  const record = candidate;
  if (typeof record.id !== 'string' || typeof record.text !== 'string' || typeof record.createdAt !== 'string') {
    return null;
  }
  const note = {
    id: record.id,
    text: record.text,
    createdAt: record.createdAt,
  };
  if (typeof record.imageUrl === 'string' && record.imageUrl) {
    note.imageUrl = record.imageUrl;
  }
  if (typeof record.date === 'string' && record.date) {
    note.date = record.date;
  }
  return note;
}

async function ensureDataStore() {
  try {
    await fsp.access(DATA_FILE, fs.constants.F_OK);
  } catch (error) {
    await fsp.writeFile(DATA_FILE, JSON.stringify({}), 'utf8');
  }
}

async function readStore() {
  await ensureDataStore();
  try {
    const content = await fsp.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to read notes store:', error);
  }
  return {};
}

async function writeStore(store) {
  const payload = JSON.stringify(store, null, 2);
  await fsp.writeFile(DATA_FILE, payload, 'utf8');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing userId parameter' }) };
    }

    try {
      const store = await readStore();
      const rawNotes = Array.isArray(store[userId]) ? store[userId] : [];
      const notes = rawNotes
        .map(sanitizeNote)
        .filter((note) => note !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { statusCode: 200, headers, body: JSON.stringify(notes) };
    } catch (error) {
      console.error('Error retrieving notes:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to fetch notes' }) };
    }
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (error) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    const userId = typeof payload.userId === 'string' ? payload.userId : null;
    const notesArray = Array.isArray(payload.notes) ? payload.notes : null;

    if (!userId || !notesArray) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Both userId and notes are required' }) };
    }

    const sanitizedNotes = notesArray
      .map(sanitizeNote)
      .filter((note) => note !== null);

    try {
      const store = await readStore();
      store[userId] = sanitizedNotes;
      await writeStore(store);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    } catch (error) {
      console.error('Error saving notes:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save notes' }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
