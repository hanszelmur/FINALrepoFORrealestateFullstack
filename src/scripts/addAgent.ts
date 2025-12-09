#!/usr/bin/env ts-node

import * as readline from 'readline';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('❌ Invalid email format');
        return false;
    }

    // Check if email already exists
    const [rows]: any = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (rows.length > 0) {
        console.error('❌ User with this email already exists');
        return false;
    }

    return true;
}

function validatePhone(phone: string): boolean {
    // Philippine phone number format: +639XXXXXXXXX or 09XXXXXXXXX
    const phoneRegex = /^(\+639|09)\d{9}$/;
    if (!phoneRegex.test(phone)) {
        console.error('❌ Invalid phone format. Use +639XXXXXXXXX or 09XXXXXXXXX');
        return false;
    }
    return true;
}

function validatePassword(password: string): boolean {
    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters long');
        return false;
    }
    return true;
}

function validateName(name: string): boolean {
    if (name.length < 2 || name.length > 100) {
        console.error('❌ Name must be between 2 and 100 characters');
        return false;
    }
    return true;
}

async function addAgent() {
    console.log('\n' + '='.repeat(50));
    console.log('🏠 Real Estate Management System');
    console.log('   Add New Agent');
    console.log('='.repeat(50) + '\n');

    try {
        // Get agent details
        let name = '';
        while (!name) {
            const input = await question('Full Name: ');
            if (validateName(input.trim())) {
                name = input.trim();
            }
        }

        let email = '';
        while (!email) {
            const input = await question('Email: ');
            if (await validateEmail(input.trim().toLowerCase())) {
                email = input.trim().toLowerCase();
            }
        }

        let password = '';
        while (!password) {
            const input = await question('Password (min 8 characters): ');
            if (validatePassword(input)) {
                password = input;
            }
        }

        let phone = '';
        while (!phone) {
            const input = await question('Phone (+639XXXXXXXXX or 09XXXXXXXXX): ');
            if (validatePhone(input.trim())) {
                phone = input.trim();
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('Creating agent account...');

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert into database
        const [result]: any = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password_hash, name, 'agent', phone, 'active']
        );

        console.log('\n✅ Agent account created successfully!\n');
        console.log('='.repeat(50));
        console.log('Agent Credentials (save these securely):');
        console.log('='.repeat(50));
        console.log(`Name:     ${name}`);
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Phone:    ${phone}`);
        console.log(`User ID:  ${result.insertId}`);
        console.log('='.repeat(50));
        console.log('\n📝 Please provide these credentials to the new agent.');
        console.log('⚠️  The agent should change their password on first login.\n');

    } catch (error: any) {
        console.error('\n❌ Error creating agent:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await pool.end();
    }
}

// Run the script
addAgent().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
