import { hashPassword, comparePassword } from '../../lib/password';

describe('hashPassword', () => {
  it('should return a bcrypt hash different from the plain text', async () => {
    const hash = await hashPassword('mySecret123');
    expect(hash).not.toBe('mySecret123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('should produce different hashes for the same input (unique salts)', async () => {
    const hash1 = await hashPassword('samePassword');
    const hash2 = await hashPassword('samePassword');
    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword', () => {
  it('should return true when plain text matches the hash', async () => {
    const hash = await hashPassword('correctPassword');
    const result = await comparePassword('correctPassword', hash);
    expect(result).toBe(true);
  });

  it('should return false when plain text does not match the hash', async () => {
    const hash = await hashPassword('correctPassword');
    const result = await comparePassword('wrongPassword', hash);
    expect(result).toBe(false);
  });

  it('should return false for an empty string against a valid hash', async () => {
    const hash = await hashPassword('somePassword');
    const result = await comparePassword('', hash);
    expect(result).toBe(false);
  });
});
