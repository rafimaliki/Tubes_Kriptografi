const EC = require('elliptic').ec;
const CryptoJS = require('crypto-js');
const { sha3_256 } = require('js-sha3');

const ec = new EC('p256');

// ==========================================
// YOUR IMPLEMENTATION (Converted to JS)
// ==========================================

function generateKeyPair(password) {
  // Requirement: Private Key derived from Password 
  const seedHex = sha3_256(password);
  const key = ec.keyFromPrivate(seedHex, 'hex');   
  return {
    publicKey: key.getPublic('hex'),
    privateKey: key.getPrivate('hex'),
  };
}

function hashMessage(message, timestamp, senderUsername, receiverUsername) {
  // Requirement: SHA-3 Hashing 
  const data = `${message}${timestamp}${senderUsername}${receiverUsername}`;
  return sha3_256(data);
}

function signMessage(privateKeyHex, messageHash) {
  const key = ec.keyFromPrivate(privateKeyHex);
  const signature = key.sign(messageHash);
  return {
    r: signature.r.toString('hex'),
    s: signature.s.toString('hex'),
  };
}

function verifySignature(publicKeyHex, messageHash, signature) {
  try {
    const key = ec.keyFromPublic(publicKeyHex, 'hex');
    return key.verify(messageHash, signature);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

function encryptMessage(publicKeyHex, plaintext) {
  const publicKey = ec.keyFromPublic(publicKeyHex, 'hex');
  const ephemeralKey = ec.genKeyPair();
  
  const sharedSecret = ephemeralKey.derive(publicKey.getPublic());
  
  // Requirement: Using SHA-3 for KDF is consistent with the spec vibe
  const encryptionKey = sha3_256(sharedSecret.toString());
  
  const encrypted = CryptoJS.AES.encrypt(plaintext, encryptionKey).toString();
  
  const ephemeralPublicKey = ephemeralKey.getPublic('hex');
  return JSON.stringify({
    ephemeralPublicKey,
    encrypted,
  });
}

function decryptMessage(privateKeyHex, encryptedData) {
  try {
    const privateKey = ec.keyFromPrivate(privateKeyHex);
    const { ephemeralPublicKey, encrypted } = JSON.parse(encryptedData);
    
    const ephemeralKey = ec.keyFromPublic(ephemeralPublicKey, 'hex');
    
    const sharedSecret = privateKey.derive(ephemeralKey.getPublic());
    
    const decryptionKey = sha3_256(sharedSecret.toString());
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, decryptionKey).toString(
      CryptoJS.enc.Utf8
    );
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// ==========================================
// 🧪 THE TEST SUITE
// ==========================================

console.log("🚀 Starting Assignment Compliance Tests...\n");

// --- TEST 1: Deterministic Key Generation (Critical for Login) ---
console.log("--- Test 1: Deterministic Key Generation (Login Simulation) ---");
// The spec says password is used as seed. The same password MUST produce the same key.
const password = "mySecretPassword123";
const keysA = generateKeyPair(password);
const keysB = generateKeyPair(password);

if (keysA.privateKey === keysB.privateKey) {
    console.log(`[PASS] Key Generation is deterministic. Password produces consistent private key.`);
    console.log(`       Private Key: ${keysA.privateKey.substring(0, 15)}...`);
} else {
    console.error(`[FAIL] Key Generation is random! Passwords must generate the same key.`);
}
console.log("");

// --- TEST 2: SHA-3 Compliance ---
console.log("--- Test 2: SHA-3 Implementation Check ---");
const testHash = hashMessage("test", "2025", "user", "user");
if (testHash.length === 64) { // 64 hex chars = 256 bits
    console.log(`[PASS] Hash length is 64 hex chars (256-bit). Matches SHA3-256 spec.`);
} else {
    console.error(`[FAIL] Hash length is ${testHash.length}. Expected 64 for SHA3-256.`);
}
console.log("");

// --- TEST 3: Full Chat Flow (Alice -> Bob) ---
console.log("--- Test 3: Full End-to-End Flow (Alice -> Bob) ---");

// Setup Users
const alice = generateKeyPair("alice_password_secure");
const bob = generateKeyPair("bob_password_secure");

// Data
const msgContent = "Final Project Deadline is Dec 1st";
const timestamp = new Date().toISOString();
const senderUser = "alice";
const receiverUser = "bob";

console.log(`Message: "${msgContent}"`);

// 1. Hash
const msgHash = hashMessage(msgContent, timestamp, senderUser, receiverUser);
// 2. Sign
const signature = signMessage(alice.privateKey, msgHash);
// 3. Encrypt
const cipherText = encryptMessage(bob.publicKey, msgContent);

console.log(`[INFO] Encrypted Payload: ${cipherText.substring(0, 40)}...`);

// 4. Bob Decrypts
const decrypted = decryptMessage(bob.privateKey, cipherText);

// 5. Bob Verifies
// Note: Receiver re-calculates hash from decrypted content
const bobReHash = hashMessage(decrypted, timestamp, senderUser, receiverUser);
const isVerified = verifySignature(alice.publicKey, bobReHash, signature);

if (decrypted === msgContent && isVerified) {
    console.log(`[PASS] Bob successfully decrypted and verified the message.`);
} else {
    console.error(`[FAIL] E2E flow broken. Decrypted: "${decrypted}", Verified: ${isVerified}`);
}
console.log("");

// --- TEST 4: Integrity/Tampering Attack (FIXED) ---
console.log("--- Test 4: Man-in-the-Middle Integrity Attack ---");

// 1. Parse the valid payload to an object
const payloadObj = JSON.parse(cipherText);

// 2. Mallory modifies the ciphertext explicitly
// We replace the last character of the encrypted string with 'A'
const originalEncrypted = payloadObj.encrypted;
// payloadObj.encrypted = originalEncrypted.substring(0, originalEncrypted.length - 1) + "A";
payloadObj.encrypted = "hello";

// 3. Re-package into a JSON string
const maliciousPayload = JSON.stringify(payloadObj);
console.log("[INFO] Mallory has modified the ciphertext.");

// 4. Bob attempts to decrypt
// Note: Changing the last byte of AES-CBC ciphertext usually corrupts the last block of plaintext.
let decryptedAttempt = decryptMessage(bob.privateKey, maliciousPayload);

// If decryption completely fails (returns empty), we treat it as garbage data for the test
if (decryptedAttempt === "") {
    decryptedAttempt = "[[Garbage Data Produced]]";
}

console.log(`[INFO] Decrypted Content: "${decryptedAttempt}"`);

// 5. Bob RE-HASHES this corrupted content
// The spec requires: "Plainteks akan di-hash ulang"
const corruptedHash = hashMessage(decryptedAttempt, timestamp, senderUser, receiverUser);

// 6. Bob VERIFIES the signature
// He checks the NEW hash against the ORIGINAL signature from Alice
const isSignatureValid = verifySignature(alice.publicKey, corruptedHash, signature);

if (isSignatureValid === false) {
    console.log(`[PASS] Integrity Check Passed: Signature verification correctly FAILED.`);
    console.log(`       The system detected that the message content does not match the signature.`);
} else {
    console.error(`[FAIL] Integrity Check Failed: The system accepted a modified message!`);
}

// --- TEST 5: Authentication/Forgery Attack ---
console.log("--- Test 5: Signature Forgery Attack ---");
// Eve tries to sign a message claiming to be Alice
const eve = generateKeyPair("eve_is_hacker");
const forgedSignature = signMessage(eve.privateKey, msgHash); // Signed by Eve, not Alice

const isForgedVerified = verifySignature(alice.publicKey, msgHash, forgedSignature);

if (!isForgedVerified) {
    console.log(`[PASS] Forged signature (by Eve) correctly rejected against Alice's public key.`);
} else {
    console.error(`[FAIL] Forged signature was accepted!`);
}

console.log("\nTests Completed.");