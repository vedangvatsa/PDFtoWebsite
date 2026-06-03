const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function checkResend() {
  if (!RESEND_API_KEY) {
    console.log("No RESEND_API_KEY found.");
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`
      }
    });
    
    const data = await res.json();
    
    if (data.error) {
      console.log("Resend API Error:", data.error);
      return;
    }
    
    console.log(`--- RESEND EMAIL STATUS ---`);
    console.log(`Recent emails sent via Resend:\n`);
    
    let count = 0;
    const stats = { delivered: 0, bounced: 0, complained: 0, sent: 0, clicked: 0 };
    
    if (data.data && data.data.length > 0) {
      data.data.slice(0, 20).forEach(email => {
        console.log(`[${new Date(email.created_at).toLocaleString()}] To: ${email.to[0]} | Status: ${email.status}`);
        count++;
      });
      
      data.data.forEach(email => {
        if (stats[email.status] !== undefined) stats[email.status]++;
        else stats[email.status] = 1;
      });
      
      console.log(`\nAggregate Status of last ${data.data.length} emails:`);
      console.log(stats);
    } else {
      console.log("No recent emails found in Resend.");
    }
  } catch (e) {
    console.log("Failed to connect to Resend API:", e.message);
  }
}

checkResend();
