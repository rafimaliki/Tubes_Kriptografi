import EC from 'elliptic';
import CryptoJS from 'crypto-js';

const ec = new EC.ec('p256'); // Elliptic Curve P-256 (secp256r1)

export function generateKeyPair() {
  const key = ec.genKeyPair();
  return {
    publicKey: key.getPublic('hex'),
    privateKey: key.getPrivate('hex'),
  };
}

export function hashMessage(
  message: string,
  timestamp: string,
  senderUsername: string,
  receiverUsername: string
): string {
  const data = `${message}${timestamp}${senderUsername}${receiverUsername}`;
  return CryptoJS.SHA256(data).toString();
}

export function signMessage(
  privateKeyHex: string,
  messageHash: string
): { r: string; s: string } {
  const key = ec.keyFromPrivate(privateKeyHex);
  const signature = key.sign(messageHash);
  return {
    r: signature.r.toString('hex'),
    s: signature.s.toString('hex'),
  };
}

export function verifySignature(
  publicKeyHex: string,
  messageHash: string,
  signature: { r: string; s: string }
): boolean {
  try {
    const key = ec.keyFromPublic(publicKeyHex, 'hex');
    return key.verify(messageHash, signature);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

export function encryptMessage(publicKeyHex: string, plaintext: string): string {
  const publicKey = ec.keyFromPublic(publicKeyHex, 'hex');
  const ephemeralKey = ec.genKeyPair();
  
  const sharedSecret = ephemeralKey.derive(publicKey.getPublic());
  
  const encryptionKey = CryptoJS.SHA256(sharedSecret.toString()).toString();
  
  const encrypted = CryptoJS.AES.encrypt(plaintext, encryptionKey).toString();
  
  const ephemeralPublicKey = ephemeralKey.getPublic('hex');
  return JSON.stringify({
    ephemeralPublicKey,
    encrypted,
  });
}

export function decryptMessage(privateKeyHex: string, encryptedData: string): string {
  try {
    const privateKey = ec.keyFromPrivate(privateKeyHex);
    const { ephemeralPublicKey, encrypted } = JSON.parse(encryptedData);
    
    const ephemeralKey = ec.keyFromPublic(ephemeralPublicKey, 'hex');
    
    const sharedSecret = privateKey.derive(ephemeralKey.getPublic());
    
    const decryptionKey = CryptoJS.SHA256(sharedSecret.toString()).toString();
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, decryptionKey).toString(
      CryptoJS.enc.Utf8
    );
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}