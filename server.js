require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { askAxario } = require('./openai');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────
app.use(express.json());

app.use(cors({
  origin: [
    'https://axario.pl',
    'https://www.axario.pl',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ─── GET /api/health ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ─── POST /api/chat ───────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ reply: 'Wiadomość jest wymagana.' });
  }

  const reply = await askAxario(message.trim());
  return res.json({ reply });
});

// ─── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono endpointu.' });
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Axario Chat Backend działa na porcie ${PORT}`);
});
