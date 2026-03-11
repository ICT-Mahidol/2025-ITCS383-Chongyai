import { signToken, verifyToken, JwtPayload } from '../../lib/jwt';
import { Role } from '@prisma/client';

const PAYLOAD: JwtPayload = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  role: Role.APPLICANT,
};

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
  process.env.JWT_EXPIRES_IN = '1h';
});

afterEach(() => {
  delete process.env.JWT_SECRET;
  delete process.env.JWT_EXPIRES_IN;
});

describe('signToken', () => {
  it('should return a JWT string with three parts', () => {
    const token = signToken(PAYLOAD);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should throw when JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    expect(() => signToken(PAYLOAD)).toThrow('JWT_SECRET is not configured');
  });

  it('should use default expiry when JWT_EXPIRES_IN is not set', () => {
    delete process.env.JWT_EXPIRES_IN;
    const token = signToken(PAYLOAD);
    expect(token).toBeTruthy();
  });
});

describe('verifyToken', () => {
  it('should decode a valid token and return the original payload', () => {
    const token = signToken(PAYLOAD);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(PAYLOAD.id);
    expect(decoded.email).toBe(PAYLOAD.email);
    expect(decoded.role).toBe(PAYLOAD.role);
  });

  it('should throw on a malformed token', () => {
    expect(() => verifyToken('not.a.valid.token')).toThrow();
  });

  it('should throw on a token signed with a different secret', () => {
    const token = signToken(PAYLOAD);
    process.env.JWT_SECRET = 'different-secret';
    expect(() => verifyToken(token)).toThrow();
  });

  it('should throw when JWT_SECRET is not set', () => {
    const token = signToken(PAYLOAD);
    delete process.env.JWT_SECRET;
    expect(() => verifyToken(token)).toThrow('JWT_SECRET is not configured');
  });

  it('should throw on an empty string', () => {
    expect(() => verifyToken('')).toThrow();
  });
});
