import {sanitizeReturnUrl} from './return-url';

describe('sanitizeReturnUrl', () => {
  it('should accept an absolute in-app path', () => {
    expect(sanitizeReturnUrl('/settings')).toBe('/settings');
    expect(sanitizeReturnUrl('/users/aprilmack/profile?tab=posts')).toBe('/users/aprilmack/profile?tab=posts');
  });

  it('should reject a protocol-relative URL', () => {
    expect(sanitizeReturnUrl('//evil.example')).toBeNull();
    expect(sanitizeReturnUrl('/\\evil.example')).toBeNull();
  });

  it('should reject an absolute URL', () => {
    expect(sanitizeReturnUrl('https://evil.example')).toBeNull();
    expect(sanitizeReturnUrl('javascript:alert(1)')).toBeNull();
  });

  it('should reject a relative path', () => {
    expect(sanitizeReturnUrl('settings')).toBeNull();
  });

  it('should reject empty and missing values', () => {
    expect(sanitizeReturnUrl('')).toBeNull();
    expect(sanitizeReturnUrl(null)).toBeNull();
    expect(sanitizeReturnUrl(undefined)).toBeNull();
  });
});
