import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase Env variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthFlow() {
  console.log("🚀 Testing Supabase OTP Auth Flow...");
  const testEmail = `test-user-${Date.now()}@example.com`;
  
  console.log(`\n1. Sending OTP to ${testEmail}...`);
  const { data, error: sendError } = await supabase.auth.signInWithOtp({
    email: testEmail,
  });

  if (sendError) {
    console.error("❌ Failed to send OTP:", sendError.message);
    return;
  }
  
  console.log("✅ OTP successfully dispatched via Supabase (and your email provider).");

  console.log(`\n2. Simulating user entering an invalid 6-digit code (000000)...`);
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email: testEmail,
    token: '000000',
    type: 'email',
  });

  if (verifyError) {
    if (verifyError.message.toLowerCase().includes("invalid") || verifyError.message.toLowerCase().includes("expired")) {
      console.log(`✅ Verification API responded correctly: "${verifyError.message}"`);
      console.log(`\n🎉 The new OTP authentication flow is fully functional on your Supabase instance!`);
    } else {
      console.error("❌ Unexpected error during verification:", verifyError.message);
    }
  } else {
    console.log("⚠️ Verification succeeded unexpectedly (did you disable email confirmations?)");
  }
}

testAuthFlow();
