import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const OTP_SECRET = process.env.OTP_SECRET || 'nfashions_otp_secure_secret_2026';

// In-memory store for OTP records (mapped by uid and email)
// Mapped as: uid -> { hash, expiresAt, attempts, lastSentAt, email, name, isVerified }
const otpStore = new Map();
const verifiedUsers = new Set();

// Helper: Hash OTP using SHA-256 with OTP_SECRET
function hashOtp(otp, uid) {
    return crypto.createHmac('sha256', OTP_SECRET).update(`${uid}:${otp}`).digest('hex');
}

// Helper: Generate secure 4-digit code (1000 - 9999)
function generate4DigitOtp() {
    return crypto.randomInt(1000, 10000).toString();
}

// Endpoint: Send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { uid, email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const storeKey = uid || normalizedEmail;
        const now = Date.now();

        // Rate limiting: 30-second resend cooldown
        const existing = otpStore.get(storeKey) || otpStore.get(normalizedEmail);
        if (existing && existing.lastSentAt && (now - existing.lastSentAt < 30000)) {
            const secondsLeft = Math.ceil((30000 - (now - existing.lastSentAt)) / 1000);
            return res.status(429).json({
                error: `Resend available in ${secondsLeft} seconds`,
                secondsLeft
            });
        }

        // Generate 4-digit OTP
        const otp = generate4DigitOtp();
        const hash = hashOtp(otp, storeKey);
        const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiry

        const record = {
            hash,
            expiresAt,
            attempts: 0,
            lastSentAt: now,
            email: normalizedEmail,
            uid: uid || '',
            name: name || 'Customer'
        };

        otpStore.set(storeKey, record);
        otpStore.set(normalizedEmail, record);

        // Email details
        const emailSubject = 'N-FASHIONS Email Verification';
        const emailMessage = `Hello ${name || 'Customer'},\n\nYour N-FASHIONS verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not create this account, please ignore this email.`;

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('[RESEND CONFIG ERROR] RESEND_API_KEY environment variable is missing.');
            return res.status(500).json({ error: 'Unable to send verification email. Please try again.' });
        }

        const resend = new Resend(resendApiKey);
        const fromAddress = process.env.RESEND_FROM || '"N-FASHIONS" <onboarding@resend.dev>';

        try {
            const { data, error: sendError } = await resend.emails.send({
                from: fromAddress,
                to: normalizedEmail,
                subject: emailSubject,
                text: emailMessage,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #000; margin-bottom: 16px;">N-FASHIONS</h2>
                        <p style="font-size: 15px;">Hello ${name || 'Customer'},</p>
                        <p style="font-size: 15px;">Your N-FASHIONS verification code is:</p>
                        <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #000;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #555;">This code will expire in 5 minutes.</p>
                        <p style="font-size: 13px; color: #888; margin-top: 24px;">If you did not create this account, please ignore this email.</p>
                    </div>
                `
            });

            if (sendError) {
                console.error(`[RESEND ERROR] Could not deliver email to ${normalizedEmail}:`, sendError.message || sendError);
                return res.status(500).json({ error: 'Unable to send verification email. Please try again.' });
            }
            console.log(`[OTP SENT VIA RESEND] To: ${normalizedEmail}, ID: ${data?.id}`);
        } catch (mailErr) {
            console.error(`[RESEND ERROR] Failed to send email to ${normalizedEmail}:`, mailErr.message);
            return res.status(500).json({ error: 'Unable to send verification email. Please try again.' });
        }

        return res.status(200).json({
            message: 'A verification code has been sent to your email.',
            cooldownSeconds: 30
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
    }
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { uid, email, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'Please enter a valid OTP code.' });
        }
        if (!email && !uid) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        const storeKey = uid || normalizedEmail;
        const record = otpStore.get(storeKey) || (normalizedEmail ? otpStore.get(normalizedEmail) : null);

        if (!record) {
            return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
        }

        const now = Date.now();

        // Expiry check
        if (now > record.expiresAt) {
            otpStore.delete(storeKey);
            if (normalizedEmail) otpStore.delete(normalizedEmail);
            return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
        }

        // Rate limiting / Max attempts
        if (record.attempts >= 5) {
            otpStore.delete(storeKey);
            if (normalizedEmail) otpStore.delete(normalizedEmail);
            return res.status(429).json({ error: 'Too many attempts. Please wait and try again later.' });
        }

        // Increment attempts count
        record.attempts += 1;

        // Hash incoming OTP and compare
        const incomingHash = hashOtp(otp.toString().trim(), record.uid || storeKey);

        if (incomingHash !== record.hash) {
            if (record.attempts >= 5) {
                otpStore.delete(storeKey);
                if (normalizedEmail) otpStore.delete(normalizedEmail);
                return res.status(429).json({ error: 'Too many attempts. Please wait and try again later.' });
            }
            return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
        }

        // Correct OTP! Single-use: delete OTP record
        const targetUid = record.uid || uid || '';
        otpStore.delete(storeKey);
        if (normalizedEmail) otpStore.delete(normalizedEmail);
        if (targetUid) verifiedUsers.add(targetUid);
        if (normalizedEmail) verifiedUsers.add(normalizedEmail);

        console.log(`[OTP VERIFIED SUCCESS] UID: ${targetUid}, Email: ${normalizedEmail}`);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login.',
            uid: targetUid,
            email: normalizedEmail
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ error: 'Failed to verify code. Please try again.' });
    }
});

// Endpoint: Check Verification Status (by UID or Email)
app.get('/api/check-verification/:identifier', (req, res) => {
    const { identifier } = req.params;
    if (!identifier) return res.status(200).json({ isVerified: false });
    const normalized = identifier.toLowerCase().trim();
    const isVerified = verifiedUsers.has(identifier) || verifiedUsers.has(normalized);
    return res.status(200).json({ isVerified });
});

// Start server
app.listen(PORT, () => {
    console.log(`N-FASHIONS Secure OTP Backend Server running on http://localhost:${PORT}`);
});
