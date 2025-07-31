import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER;

export const messaging = {
  async send(to, message) {
    try {
      const result = await client.messages.create({
        from: `whatsapp:${WHATSAPP_FROM}`,
        to: `whatsapp:${to}`,
        body: message
      });
      return result;
    } catch (error) {
      console.error('Twilio error:', error);
      throw error;
    }
  },

  // Create TwiML response for webhook
  createResponse(message) {
    const response = new twilio.twiml.MessagingResponse();
    response.message(message);
    return response.toString();
  }
};

// Helper to parse incoming message
export function parseMessage(body) {
  const parts = body.trim().split(' ');
  const command = parts[0].toUpperCase();
  
  switch (command) {
    case 'JOIN':
      // JOIN John Doe A+ Mumbai
      return {
        type: 'register',
        name: parts.slice(1, -2).join(' '),
        bloodType: parts[parts.length - 2],
        location: parts[parts.length - 1]
      };
    
    case 'NEED':
      // NEED A+ or NEED A+ URGENT
      return {
        type: 'request',
        bloodType: parts[1],
        urgent: parts[2] === 'URGENT'
      };
    
    case 'HELP':
      return { type: 'help' };
    
    default:
      return { type: 'unknown' };
  }
}