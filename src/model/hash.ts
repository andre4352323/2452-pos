// Uses the Web Crypto API PBKDF2 with SHA-256

const ITERATIONS = 100_000;
const KEY_LENGTH = 256; // bits
const ALGORITHM = "SHA-256";

//FIXED SALT
const SALT = new TextEncoder().encode("pos-app-salt-2452");

export async function hashPassword(password: string): Promise<string> {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: SALT,
            iterations: ITERATIONS,
            hash: ALGORITHM,
        },
        keyMaterial,
        KEY_LENGTH
    );

    // convert to hex string for storage
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}