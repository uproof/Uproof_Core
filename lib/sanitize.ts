/**
 * Security utility functions for input sanitization
 */

/**
 * Normalize plain-text input.
 * HTML and URL escaping should happen at the sink, not by stripping fragments here.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Normalize control characters and repeated whitespace, but keep the text intact.
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize email input
 * Validates and cleans email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Basic sanitization
  const sanitized = email.trim().toLowerCase();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + and spaces
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Keep only numbers, +, spaces, and hyphens
  return phone.replace(/[^\d\s+\-()]/g, '').trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate string length
 */
export function validateLength(input: string, min: number, max: number): boolean {
  const length = input.trim().length;
  return length >= min && length <= max;
}
