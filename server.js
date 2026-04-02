require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const { askAxario }   = require('./openai');
const { sendQuoteMails } = require('./mailer');
const { validateQuote }  = require('./validators');

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

// ─── Rate limit tylko dla /api/quote ─────────────────────
// Max 5 zgłoszeń na 15 minut z jednego IP
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.' },
});

// ─── GET /api/health ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ─── POST /api/chat (istniejący endpoint chatbota) ────────
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ reply: 'Wiadomość jest wymagana.' });
  }

  const reply = await askAxario(message.trim());
  return res.json({ reply });
});

// ─── POST /api/quote (nowy endpoint formularza wyceny) ────
app.post('/api/quote', quoteLimiter, async (req, res) => {
  const {
    name,
    email,
    phone,
    projectType,
    message,
    budget,
    consent,
    website, // honeypot — ma być puste
  } = req.body;

  // Honeypot — jeśli bot wypełnił ukryte pole, odrzucamy cicho
  if (website && website.trim() !== '') {
    // Zwracamy 200 żeby bot myślał że wysłał — nie dajemy info o odrzuceniu
    return res.status(200).json({ success: true, message: 'Wysłano.' });
  }

  // Walidacja
  const errors = validateQuote({ name, email, projectType, message, consent });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Błędne dane.', errors });
  }

  // Wysyłka maili
  try {
    await sendQuoteMails({ name, email, phone, projectType, message, budget });
  } catch (err) {
    console.error('[mailer] błąd wysyłki:', err.message);
    return res.status(500).json({ success: false, message: 'Błąd serwera przy wysyłce maila.' });
  }

  return res.status(200).json({ success: true, message: 'Zgłoszenie przyjęte. Odezwiemy się wkrótce.' });
});

// ─── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono endpointu.' });
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Axario Backend działa na porcie ${PORT}`);
});
