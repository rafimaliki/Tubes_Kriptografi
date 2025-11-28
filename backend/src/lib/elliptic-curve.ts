import EC from 'elliptic';
import SHA3 from 'js-sha3';

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

export function generateKeyPair(password: string):{ publicKey: string; privateKey: string } {
  const seedHex = SHA3.sha3_256(password);

  const key = ec.keyFromPrivate(seedHex, 'hex');  
  return {
    publicKey: key.getPublic('hex'),
    privateKey: key.getPrivate('hex'),
  };
}