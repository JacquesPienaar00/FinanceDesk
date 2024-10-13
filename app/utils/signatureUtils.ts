// utils/generateSignature.ts
import crypto from 'crypto';

export const generateSignature = (
  data: Record<string, string>,
  passPhrase: string | null = null,
): string => {
  // Create parameter string
  let pfOutput = '';
  for (const [key, value] of Object.entries(data)) {
    if (value !== '') {
      pfOutput += `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(getString).digest('hex');
};
