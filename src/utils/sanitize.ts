export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
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
