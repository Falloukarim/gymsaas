import crypto from 'crypto';

/**
 * Parse le payload PayDunya (JSON ou URL-encoded)
 */
export function parsePaydunyaPayload(rawData: string): any {
  try {
    if (rawData.trim().startsWith('{')) {
      return JSON.parse(rawData);
    }

    const params = new URLSearchParams(rawData);
    const result: any = { data: {} };

    params.forEach((value, key) => {
      if (key.startsWith('data[')) {
        const path = key
          .replace(/data\[|\]/g, '')
          .split('[')
          .filter(Boolean);

        let current = result.data;
        path.forEach((part, index) => {
          if (index === path.length - 1) {
            current[part] = value;
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        });
      } else {
        result[key] = value;
      }
    });

    return result;
  } catch (error) {
    console.error('Error parsing payload:', error);
    throw new Error('Invalid payload format');
  }
}

/**
 * Vérifie la signature HMAC-SHA1 du payload PayDunya
 */
export function verifyPaydunyaSignature(
  rawPayload: string,
  receivedSignature: string | null,
  privateKey: string
): boolean {
  if (!receivedSignature) return false;

  const computedSignature = crypto
    .createHmac('sha1', privateKey)
    .update(rawPayload)
    .digest('hex');

  return computedSignature === receivedSignature;
}
