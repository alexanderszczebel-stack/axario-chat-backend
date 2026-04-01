require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { askAxario } = require('./openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: [
    'https://axario.pl',
    'https://www.axario.pl',
    'https://axario.pages.dev'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Brak wiadomości.'
      });
    }

    const reply = await askAxario(message.trim());

    return res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);

    return res.status(500).json({
      error: 'Wystąpił błąd serwera.'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Nie znaleziono endpointu.'
  });
});

app.listen(PORT, () => {
  console.log(`Axario backend running on port ${PORT}`);
});
