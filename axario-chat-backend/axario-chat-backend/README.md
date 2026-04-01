# Axario Chat Backend

Backend chatbota AI dla strony axario.pl.  
Stack: Node.js + Express + OpenAI API. Gotowy do wdrożenia na Render.

## Struktura

```
axario-chat-backend/
├── server.js        ← Express, endpointy /api/chat i /api/health
├── openai.js        ← wywołanie OpenAI + system prompt Axario
├── package.json
├── .env.example     ← skopiuj do .env lokalnie
└── .gitignore
```

---

## Uruchomienie lokalne

```bash
# 1. Zainstaluj zależności
npm install

# 2. Stwórz plik .env
cp .env.example .env
# Wpisz swój klucz OpenAI w .env

# 3. Uruchom
npm run dev       # z nodemon (auto-reload)
# lub
npm start         # produkcja
```

Sprawdź:
```bash
curl http://localhost:3000/api/health
# → { "ok": true, "timestamp": "..." }

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ile kosztuje strona firmowa?"}'
# → { "reply": "..." }
```

---

## Deploy na Render

### Krok 1 — GitHub
Wrzuć folder `axario-chat-backend/` jako **osobne repozytorium** na GitHub.

```bash
git init
git add .
git commit -m "init: axario chat backend"
git remote add origin https://github.com/TWOJ-USER/axario-chat-backend.git
git push -u origin main
```

### Krok 2 — Render
1. Wejdź na **render.com** → **New** → **Web Service**
2. Połącz repozytorium `axario-chat-backend`
3. Ustaw:

| Pole | Wartość |
|------|---------|
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (wystarczy) |

### Krok 3 — Zmienne środowiskowe
W Render → **Environment** dodaj:

| Klucz | Wartość |
|-------|---------|
| `OPENAI_API_KEY` | `sk-proj-...` (Twój klucz z OpenAI) |

### Krok 4 — Gotowe
Render da Ci URL, np.:
```
https://axario-chat-backend.onrender.com
```

---

## Podpięcie frontendu

W pliku `script.js` na stronie Axario zmień jeden wiersz:

```js
// PRZED (względny URL — działał tylko gdy backend był na tym samym serwerze):
const response = await fetch('/api/chat', { ... });

// PO (bezwzględny URL Render):
const response = await fetch('https://axario-chat-backend.onrender.com/api/chat', { ... });
```

---

## Uwagi

- **Free tier Render** — serwer "zasypia" po 15 min bezczynności. Pierwsze zapytanie po uśpieniu może trwać ~20s. Jeśli to problem, wykup plan Starter ($7/mies.)
- **Koszty OpenAI** — model `gpt-4o-mini` to ok. $0.0001 za wiadomość. Przy 1000 wiadomościach/mies. = ~$0.10
- **Zmiana modelu** — w `openai.js` linia `model: 'gpt-4o-mini'` — możesz zmienić na `gpt-4o` dla lepszych odpowiedzi (droższy)
- **System prompt** — cała persona chatbota jest w `openai.js` w stałej `SYSTEM_PROMPT` — edytuj wedle potrzeb
