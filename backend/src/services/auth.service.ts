import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';

// Constants
const BCRYPT_COST_FACTOR = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'aurora-dev-secret-change-in-production';
const JWT_EXPIRES_HOURS = parseInt(process.env.JWT_EXPIRES_HOURS || '24', 10);

// Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface UserWithPassword extends User {
    password_hash: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface LoginResult {
    token: string;
    user: Omit<User, 'password_hash'>;
}

/**
 * Hash a password using bcrypt with cost factor 12
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: `${JWT_EXPIRES_HOURS}h`,
    });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await query<UserWithPassword>(
        'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
    const result = await query<User>(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0] || null;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
    email: string,
    password: string
): Promise<LoginResult | null> {
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return null;
    }

    // Generate token
    const token = generateToken(user);

    // Return user without password hash
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
        token,
        user: userWithoutPassword,
    };
}

/**
 * Create a new user (for registration/seeding)
 */
export async function createUser(
    email: string,
    password: string,
    name?: string
): Promise<User> {
    const passwordHash = await hashPassword(password);

    const result = await query<User>(
        `INSERT INTO users (email, password_hash, name) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, name, created_at, updated_at`,
        [email, passwordHash, name || null]
    );

    return result.rows[0];
}
