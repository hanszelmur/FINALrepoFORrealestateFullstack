export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    
    return input
        .trim()
        // Remove HTML tags and potentially dangerous characters
        .replace(/[<>]/g, '')
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Escape common XSS vectors
        .replace(/[&"']/g, (char) => {
            const escapeMap: Record<string, string> = {
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[char] || char;
        });
};

export const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? sanitizeInput(obj) : obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }
    
    return sanitized;
};
