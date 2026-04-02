const nodemailer = require('nodemailer');

// ─── Transporter SMTP ─────────────────────────────────────
// Konfiguracja przez env variables — działa z Gmail, Outlook, SMTP własnym
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true dla portu 465, false dla 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Wysyłka 2 maili: do właściciela + potwierdzenie do klienta ──
async function sendQuoteMails({ name, email, phone, projectType, message, budget }) {
  const ownerEmail  = process.env.MAIL_TO   || process.env.SMTP_USER;
  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

  // 1. Mail do właściciela z pełnym zgłoszeniem
  await transporter.sendMail({
    from:    `"Axario Formularz" <${fromAddress}>`,
    to:      ownerEmail,
    replyTo: email,
    subject: `📋 Nowe zgłoszenie wyceny — ${projectType}`,
    html:    buildOwnerEmail({ name, email, phone, projectType, message, budget }),
  });

  // 2. Mail do klienta z potwierdzeniem
  await transporter.sendMail({
    from:    `"Axario" <${fromAddress}>`,
    to:      email,
    subject: 'Otrzymaliśmy Twoje zgłoszenie — Axario',
    html:    buildClientEmail({ name, projectType }),
  });
}

// ─── Szablon maila do właściciela ────────────────────────
function buildOwnerEmail({ name, email, phone, projectType, message, budget }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
      <h2 style="font-size:20px;margin:0 0 24px;color:#111;">📋 Nowe zgłoszenie wyceny</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">Imię i nazwisko</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111;font-weight:500;">${escape(name)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111;">${escape(email)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Telefon</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111;">${phone ? escape(phone) : '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Typ projektu</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111;">${escape(projectType)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Budżet</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111;">${budget ? escape(budget) : '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Wiadomość</td>
          <td style="padding:10px 0;color:#111;line-height:1.6;">${escape(message).replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
        Wysłane ${new Date().toLocaleString('pl-PL')} przez formularz na axario.pl
      </p>
    </div>
  `;
}

// ─── Szablon maila potwierdzającego do klienta ────────────
function buildClientEmail({ name, projectType }) {
  const firstName = escape(name).split(' ')[0];
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
      <h2 style="font-size:22px;margin:0 0 16px;color:#111;">Cześć, ${firstName}! 👋</h2>
      <p style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 16px;">
        Dostaliśmy Twoje zgłoszenie dotyczące <strong>${escape(projectType)}</strong>.
        Odezwiemy się do Ciebie w ciągu 24 godzin.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 32px;">
        Jeśli masz dodatkowe pytania, napisz bezpośrednio na
        <a href="mailto:kontakt@axario.pl" style="color:#3b82f6;">kontakt@axario.pl</a>.
      </p>
      <div style="border-top:1px solid #e5e7eb;padding-top:24px;">
        <p style="font-size:14px;color:#6b7280;margin:0;">
          Pozdrawiamy,<br>
          <strong style="color:#111;">Zespół Axario</strong><br>
          <a href="https://axario.pl" style="color:#3b82f6;font-size:13px;">axario.pl</a>
        </p>
      </div>
    </div>
  `;
}

// ─── Prosty escape HTML żeby zapobiec injection w mailach ─
function escape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendQuoteMails };
