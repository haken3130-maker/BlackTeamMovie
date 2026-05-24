let CryptoJS: any;

async function getCryptoJS() {
  if (!CryptoJS) {
    CryptoJS = (await import('crypto-js')).default;
  }
  return CryptoJS;
}

const SECRET_KEY = 'BlackTeam_Secret_Key_2024_!#';

export async function decryptLink(encrypted: string): Promise<string> {
  if (!encrypted || encrypted.startsWith('http')) return encrypted;
  try {
    const cjs = await getCryptoJS();
    const bytes = cjs.AES.decrypt(encrypted, SECRET_KEY);
    const result = bytes.toString(cjs.enc.Utf8);
    if (!result || !result.startsWith('http')) return encrypted;
    return result;
  } catch {
    return encrypted;
  }
}
