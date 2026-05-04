const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { cart, phone, total } = JSON.parse(event.body);
        
        let msg = `*Order Confirmation from Amazon AI*\n\n`;
        cart.forEach(item => {
            msg += `- ${item.name} (Size: ${item.selectedSize}) - $${item.price.toFixed(2)}\n`;
        });
        msg += `\n*Total Paid: $${total.toFixed(2)}*\n\nYour order is confirmed and will be shipped soon!`;

        // If Twilio keys are configured, send real SMS
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
            const params = new URLSearchParams({
                To: phone,
                From: TWILIO_PHONE_NUMBER,
                Body: msg
            });

            await fetch(twilioUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
                },
                body: params.toString()
            });
            
            return { statusCode: 200, body: JSON.stringify({ success: true, message: "Real SMS sent via Twilio" }) };
        } else {
            // Fallback for local dev without Twilio keys
            return { statusCode: 200, body: JSON.stringify({ success: true, message: "Mock SMS processed", receipt: msg }) };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Checkout processing failed", details: error.toString() })
        };
    }
};
