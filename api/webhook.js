import { db } from './utils/supabase.js';
import { messaging, parseMessage } from './utils/twilio.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { From, Body } = req.body;
        const phone = From.replace('whatsapp:', '');
        const parsed = parseMessage(Body);

        let responseMessage;

        switch (parsed.type) {
            case 'register':
                await handleRegister(phone, parsed);
                responseMessage = `✅ Welcome ${parsed.name}! You're registered as ${parsed.bloodType} donor in ${parsed.location}. We'll notify you when someone needs your blood type.`;
                break;

            case 'request':
                const patient = await handleRequest(phone, parsed);
                responseMessage = `🩸 Blood request received for ${parsed.bloodType}${parsed.urgent ? ' (URGENT)' : ''}. Searching for donors...`;

                // --- START: FINAL CORRECTED CODE ---
                let baseUrl;
                // This is the Vercel system environment variable that tells us if we are in production
                if (process.env.VERCEL_ENV === 'production') {
                    baseUrl = `https://${process.env.VERCEL_URL}`;
                } else {
                    // For all other environments (like local development), use http
                    baseUrl = 'http://localhost:3000';
                }

                const matchUrl = `${baseUrl}/api/match`;
                console.log(`--- WEBHOOK: Attempting to trigger match function at URL: ${matchUrl}`);

                fetch(matchUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId: patient.id })
                }).catch(fetchError => {
                    console.error('--- WEBHOOK: CRITICAL ERROR - The fetch call to the match function failed:', fetchError);
                });

                // --- END: FINAL CORRECTED CODE ---
                break;

            case 'help':
                responseMessage = `🩸 BloodBridge Bot Commands:
        
📝 JOIN [Name] [Blood Type] [City]
Example: JOIN John Doe A+ Mumbai

🆘 NEED [Blood Type] [URGENT]
Example: NEED A+ URGENT

❓ HELP - Show this message`;
                break;

            default:
                responseMessage = `❓ I didn't understand that. Send HELP for available commands.`;
        }

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(messaging.createResponse(responseMessage));

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).send(messaging.createResponse('❌ Something went wrong. Please try again.'));
    }
}

async function handleRegister(phone, { name, bloodType, location }) {
    if (!name || !bloodType || !location) {
        throw new Error('Missing required information');
    }

    return await db.upsertDonor(phone, name, bloodType, location);
}

async function handleRequest(phone, { bloodType, urgent }) {
    if (!bloodType) {
        throw new Error('Blood type required');
    }

    return await db.addPatient(phone, bloodType, urgent);
}