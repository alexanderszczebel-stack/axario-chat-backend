# Axario Backend — Chat + Wycena

Backend dla axario.pl: chatbot AI (OpenAI) + formularz wyceny (nodemailer).

## Pliki

```
server.js       ← endpointy: /api/health, /api/chat, /api/quote
openai.js       ← logika chatbota AI
mailer.js       ← wysyłka 2 maili przez SMTP
validators.js   ← walidacja formularza wyceny
package.json
.env.example
.gitignore
```

---

## Deploy na Render

### 1. Env variables — dodaj w Render → Environment

| Klucz | Opis |
|-------|------|
| `OPENAI_API_KEY` | Klucz z platform.openai.com |
| `SMTP_HOST` | np. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` (dla 587), `true` dla 465 |
| `SMTP_USER` | Twój adres email (nadawca) |
| `SMTP_PASS` | Hasło aplikacji (nie zwykłe hasło!) |
| `MAIL_TO` | Twój mail do odbierania zgłoszeń |
| `MAIL_FROM` | Adres nadawcy w mailach |

### 2. Gmail — App Password
Gmail wymaga "Hasła aplikacji" zamiast zwykłego hasła:
1. Google Account → Security → 2-Step Verification (musi być włączone)
2. Google Account → Security → App Passwords
3. Stwórz hasło dla "Mail" → skopiuj 16 znaków → wklej jako `SMTP_PASS`

### 3. Build & Start
| Pole | Wartość |
|------|---------|
| Build Command | `npm install` |
| Start Command | `npm start` |

---

## Testy curl

### Health check
```bash
curl https://axario-chat-backend.onrender.com/api/health
# → { "ok": true }
```

### Chat
```bash
curl -X POST https://axario-chat-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ile kosztuje strona firmowa?"}'
# → { "reply": "..." }
```

### Wycena — poprawne dane
```bash
curl -X POST https://axario-chat-backend.onrender.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan Kowalski",
    "email": "jan@firma.pl",
    "phone": "500000000",
    "projectType": "Strona firmowa",
    "message": "Potrzebuję strony dla kliniki.",
    "budget": "3000-5000 zł",
    "consent": true
  }'
# → { "success": true, "message": "Zgłoszenie przyjęte..." }
```

### Wycena — błędne dane
```bash
curl -X POST https://axario-chat-backend.onrender.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "zly-email", "consent": false}'
# → { "success": false, "errors": [...] }
```

### Honeypot — bot wypełnił ukryte pole
```bash
curl -X POST https://axario-chat-backend.onrender.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{"name": "Bot", "email": "bot@spam.com", "website": "http://spam.com", "consent": true}'
# → { "success": true } (cicha odmowa — bot nie wie że został odrzucony)
```

### Rate limit — po 5 próbach w 15 minut
```bash
# 6. próba zwróci:
# HTTP 429 → { "success": false, "message": "Zbyt wiele prób..." }
```

---

## Frontend — podpięcie formularza

W `script.js` na stronie Axario wyślij JSON do endpointu:

```js
const res = await fetch('https://axario-chat-backend.onrender.com/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name:        form.name.value,
    email:       form.email.value,
    phone:       form.phone.value,       // opcjonalne
    projectType: form.projectType.value,
    message:     form.message.value,
    budget:      form.budget.value,      // opcjonalne
    consent:     form.consent.checked,
    website:     form.website?.value,    // honeypot — ukryte pole w HTML
  }),
});
const data = await res.json();
```

Honeypot w HTML formularza (niewidoczne dla ludzi, widoczne dla botów):
```html
<input type="text" name="website" id="website"
  style="display:none" tabindex="-1" autocomplete="off" />
```
