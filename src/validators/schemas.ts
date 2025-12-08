import Joi from 'joi';

// Philippine phone number pattern: +639XXXXXXXXX or 09XXXXXXXXX
const philippinePhonePattern = /^(\+639|09)\d{9}$/;

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    })
});

export const propertySchema = Joi.object({
    title: Joi.string().required().min(5).max(255).messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 255 characters',
        'any.required': 'Title is required'
    }),
    description: Joi.string().allow('').optional(),
    property_type: Joi.string()
        .valid('house', 'condo', 'townhouse', 'lot', 'commercial')
        .required()
        .messages({
            'any.only': 'Invalid property type',
            'any.required': 'Property type is required'
        }),
    status: Joi.string()
        .valid('available', 'reserved', 'sold', 'archived')
        .default('available'),
    price: Joi.number().min(0).required().messages({
        'number.min': 'Price must be a positive number',
        'any.required': 'Price is required'
    }),
    location: Joi.string().required().messages({
        'any.required': 'Location is required'
    }),
    address: Joi.string().allow('').optional(),
    bedrooms: Joi.number().integer().min(0).allow(null).optional(),
    bathrooms: Joi.number().integer().min(0).allow(null).optional(),
    floor_area: Joi.number().min(0).allow(null).optional(),
    lot_area: Joi.number().min(0).allow(null).optional(),
    features: Joi.array().items(Joi.string()).optional(),
    agent_id: Joi.number().integer().positive().allow(null).optional()
});

export const inquirySchema = Joi.object({
    property_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Property ID is required'
    }),
    client_name: Joi.string().required().min(2).max(255).messages({
        'string.min': 'Client name must be at least 2 characters',
        'any.required': 'Client name is required'
    }),
    client_email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Client email is required'
    }),
    client_phone: Joi.string()
        .pattern(philippinePhonePattern)
        .required()
        .messages({
            'string.pattern.base': 'Invalid Philippine phone number format (use +639XXXXXXXXX or 09XXXXXXXXX)',
            'any.required': 'Client phone is required'
        }),
    message: Joi.string().allow('').optional()
});

export const inquiryUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(
            'new',
            'contacted',
            'viewing_scheduled',
            'viewing_completed',
            'negotiating',
            'deposit_paid',
            'reserved',
            'payment_processing',
            'sold',
            'cancelled',
            'expired'
        )
        .optional(),
    assigned_to: Joi.number().integer().positive().allow(null).optional(),
    commission_amount: Joi.number().min(0).allow(null).optional(),
    notes: Joi.string().allow('').optional()
});

export const calendarEventSchema = Joi.object({
    title: Joi.string().required().min(3).max(255).messages({
        'string.min': 'Title must be at least 3 characters',
        'any.required': 'Title is required'
    }),
    description: Joi.string().allow('').optional(),
    event_type: Joi.string()
        .valid('viewing', 'meeting', 'deadline', 'other')
        .required()
        .messages({
            'any.only': 'Invalid event type',
            'any.required': 'Event type is required'
        }),
    start_time: Joi.date().iso().required().messages({
        'any.required': 'Start time is required',
        'date.format': 'Invalid date format'
    }),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required().messages({
        'any.required': 'End time is required',
        'date.greater': 'End time must be after start time'
    }),
    property_id: Joi.number().integer().positive().allow(null).optional(),
    inquiry_id: Joi.number().integer().positive().allow(null).optional(),
    agent_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Agent ID is required'
    }),
    status: Joi.string()
        .valid('scheduled', 'completed', 'cancelled')
        .default('scheduled')
});

export const userRegistrationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
            'any.required': 'Password is required'
        }),
    full_name: Joi.string().required().min(2).max(255).messages({
        'string.min': 'Full name must be at least 2 characters',
        'any.required': 'Full name is required'
    }),
    role: Joi.string().valid('admin', 'agent').default('agent'),
    phone: Joi.string().pattern(philippinePhonePattern).optional().messages({
        'string.pattern.base': 'Invalid Philippine phone number format'
    })
});
