import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { getStatusPinPepper } from '../common/env';

function safeStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPublicStatusPin(token: string, pin: string): string {
  return createHmac('sha256', getStatusPinPepper())
    .update(`${token}:${pin}`)
    .digest('hex');
}

export function createPublicShareCredentials(): {
  token: string;
  pin: string;
  pinHash: string;
} {
  const token = randomBytes(16).toString('hex');
  const pin = randomInt(0, 10000).toString().padStart(4, '0');
  const pinHash = hashPublicStatusPin(token, pin);

  return {
    token,
    pin,
    pinHash,
  };
}

export function verifyPublicStatusPin(params: {
  token: string;
  providedPin: string;
  sharePinHash: string | null;
  sharePin: string | null;
}): {
  providedPinHash: string;
  matchesHashedPin: boolean;
  matchesLegacyPin: boolean;
} {
  const providedPinHash = hashPublicStatusPin(params.token, params.providedPin);
  const matchesHashedPin = params.sharePinHash
    ? safeStringEqual(params.sharePinHash, providedPinHash)
    : false;
  const matchesLegacyPin =
    !matchesHashedPin &&
    !!params.sharePin &&
    safeStringEqual(params.sharePin, params.providedPin);

  return {
    providedPinHash,
    matchesHashedPin,
    matchesLegacyPin,
  };
}
