import * as CryptoJS from 'crypto-js';

let secretKey = 'BlackTeam_Secret_Key_2024_!#';

export function setSecretKey(key: string) {
  secretKey = key;
}

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}
