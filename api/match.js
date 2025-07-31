// functions/match.js
import { db } from './utils/supabase.js';
import { messaging } from './utils/twilio.js';
import supabase from './utils/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { patientId } = req.body;

        // --- 1. ADD THIS LINE TO SEE IF THE FUNCTION STARTS ---
        console.log(`--- MATCH: Starting match process for patient ID: ${patientId}`);

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID required' });
        }

        // Find compatible donors
        const matches = await db.findMatches(patientId);

        // --- 2. ADD THIS LINE TO SEE WHAT THE DATABASE FOUND ---
        console.log('--- MATCH: Found matches from database:', matches);

        if (matches.length === 0) {
            // --- 3. ADD THIS LINE TO SEE IF IT THINKS NO MATCHES WERE FOUND ---
            console.log('--- MATCH: No matches found. Notifying patient.');

            // Notify patient that no donors found
            const patient = await getPatient(patientId);
            await messaging.send(
                patient.phone,
                `😔 No available donors found for ${patient.blood_type} right now. We'll keep looking and notify you when someone registers.`
            );

            return res.json({ success: true, matches: 0 });
        }

        // Create match records and notify donors
        const notifications = [];

        for (const match of matches.slice(0, 3)) { // Max 3 donors
            // Create match record
            await db.createMatch(match.patient_id, match.donor_id);

            // Notify donor
            const donorMessage = `🩸 BLOOD NEEDED! 
      
Someone needs ${match.needed_type} blood type. 

If you can donate, please reply with:
YES - I can donate
NO - Not available

Thank you for being a lifesaver! ❤️`;

            notifications.push(
                messaging.send(match.donor_phone, donorMessage)
            );
        }

        // Wait for all notifications to send
        await Promise.all(notifications);

        // Notify patient about progress
        const patientMessage = `✅ Found ${matches.length} compatible donor${matches.length > 1 ? 's' : ''}! We've notified them. You'll hear back soon.`;
        await messaging.send(matches[0].patient_phone, patientMessage);

        res.json({
            success: true,
            matches: matches.length,
            notified: notifications.length
        });

    } catch (error) {
        console.error('Match error:', error);
        res.status(500).json({ error: 'Matching failed' });
    }
}

async function getPatient(patientId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

    if (error) throw error;
    return data;
}