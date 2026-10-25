import DOMPurify from 'dompurify';

/**
 * Robust HTML sanitizer using DOMPurify
 * Strips script execution, inline event handlers (onload, onerror), javascript: URIs,
 * and dangerous HTML tags while preserving clean rich-text styling and table layouts.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  // In browser runtime, use DOMPurify
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'img', 'blockquote', 'code', 'pre'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'src', 'alt', 'title', 'class', 'style',
        'width', 'height', 'align', 'valign', 'border', 'cellpadding', 'cellspacing'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ['rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }

  // Fallback for SSR / Node.js execution
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*(?:(["'])\s*javascript:[^"']*\1|javascript:[^\s>]+)/gi, 'href="#"')
    .replace(/javascript\s*:/gi, 'blocked:');
}
