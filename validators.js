const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateQuote({ name, email, projectType, message, consent }) {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Imię i nazwisko jest wymagane.' });
  }

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email jest wymagany.' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Niepoprawny format emaila.' });
  }

  if (!projectType || projectType.trim() === '') {
    errors.push({ field: 'projectType', message: 'Typ projektu jest wymagany.' });
  }

  if (!message || message.trim() === '') {
    errors.push({ field: 'message', message: 'Wiadomość jest wymagana.' });
  }

  if (consent !== true && consent !== 'true') {
    errors.push({ field: 'consent', message: 'Zgoda na przetwarzanie danych jest wymagana.' });
  }

  return errors;
}

module.exports = { validateQuote };
