import EC from 'elliptic';

const ec = new EC.ec('p256'); // Elliptic Curve P-256 (secp256r1)

export function verifySignature(
  publicKeyHex: string,
  messageHash: string,
  signatureJson: string
): boolean {
  try {
    const signature = JSON.parse(signatureJson);
    const key = ec.keyFromPublic(publicKeyHex, 'hex');
    return key.verify(messageHash, signature);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}