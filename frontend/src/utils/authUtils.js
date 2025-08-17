// English: validate if email ends with @oedi.gob.pe
export function isValidOediEmail(email) {
  if (!email) return false;
  return /^[a-z0-9._%+-]+@oedi\.gob\.pe$/i.test(email.trim());
}
