# Axario Chat Backend

Backend chatbota AI dla strony axario.pl.
Node.js + Express + OpenAI API. Gotowy do Render.

---

## Pliki do wrzucenia do repo

```
server.js
openai.js
package.json
.env.example
.gitignore
README.md
```

NIE wrzucaj: `node_modules/`, `.env`

---

## Deploy na Render

1. Wejdź na render.com → **New Web Service**
2. Połącz repozytorium GitHub
3. Ustaw:

| Pole | Wartość |
|------|---------|
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |

4. W zakładce **Environment** dodaj zmienną:

| Klucz | Wartość |
|-------|---------|
| `OPENAI_API_KEY` | `sk-proj-...` |

5. Kliknij **Deploy** — Render da Ci URL np.:
   `https://axario-chat-backend.onrender.com`

---

## Podpięcie frontendu

W `script.js` na stronie zmień URL chatbota:

```js
const CHAT_API_URL = 'https://axario-chat-backend.onrender.com/api/chat';
```

---

## Sprawdzenie czy działa

```bash
curl https://axario-chat-backend.onrender.com/api/health
# → { "ok": true }

curl -X POST https://axario-chat-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Ile kosztuje strona firmowa?"}'
# → { "reply": "..." }
```
