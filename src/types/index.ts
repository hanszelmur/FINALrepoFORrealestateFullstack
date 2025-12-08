import { Request } from 'express';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    full_name: string;
    role: 'admin' | 'agent';
    phone?: string;
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: 'admin' | 'agent';
    };
}

export interface Property {
    id: number;
    title: string;
    description?: string;
    property_type: 'house' | 'condo' | 'townhouse' | 'lot' | 'commercial';
    status: 'available' | 'reserved' | 'sold' | 'archived';
    price: number;
    location: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    lot_area?: number;
    features?: string[];
    reservation_type: 'none' | 'deposit' | 'full_payment';
    reservation_date?: Date;
    reservation_expiry?: Date;
    reserved_by_inquiry_id?: number;
    agent_id?: number;
    created_at: Date;
    updated_at: Date;
}

export interface Inquiry {
    id: number;
    property_id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    message?: string;
    status: InquiryStatus;
    assigned_to?: number;
    commission_amount?: number;
    commission_locked: boolean;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export type InquiryStatus =
    | 'new'
    | 'contacted'
    | 'viewing_scheduled'
    | 'viewing_completed'
    | 'negotiating'
    | 'deposit_paid'
    | 'reserved'
    | 'payment_processing'
    | 'sold'
    | 'cancelled'
    | 'expired';

export interface InquiryStatusHistory {
    id: number;
    inquiry_id: number;
    old_status?: InquiryStatus;
    new_status: InquiryStatus;
    changed_by: number;
    notes?: string;
    created_at: Date;
}

export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    event_type: 'viewing' | 'meeting' | 'deadline' | 'other';
    start_time: Date;
    end_time: Date;
    property_id?: number;
    inquiry_id?: number;
    agent_id: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: Date;
    updated_at: Date;
}

export interface PropertyPhoto {
    id: number;
    property_id: number;
    photo_path: string;
    thumbnail_path: string;
    is_primary: boolean;
    display_order: number;
    created_at: Date;
}

export interface AgentStats {
    agent_id: number;
    full_name: string;
    email: string;
    total_properties: number;
    sold_inquiries: number;
    active_inquiries: number;
    total_commission: number;
}
