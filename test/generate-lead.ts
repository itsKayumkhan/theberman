
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://hsxqcbcgpruldodaxmdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeHFjYmNncHJ1bGRvZGF4bWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjg4MTksImV4cCI6MjA4NDgwNDgxOX0.PCES_0gQp7JO6DG4ces4qPeCaeA0xGFN0uZFKWvG2CI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const generateRandomLead = () => {
    const timestamp = new Date().getTime();
    return {
        name: `Test User ${timestamp}`,
        email: `test.user.${timestamp}@example.com`,
        phone: `087 ${Math.floor(1000000 + Math.random() * 9000000)}`,
        county: 'Dublin',
        town: 'Test Town',
        property_type: 'Detached',
        purpose: 'Selling',
        message: 'This is a test inquiry generated automatically to verify email promotions.',
    };
};

async function createLead() {
     
    const leadData = generateRandomLead();


    // 1. Insert into Database
    const { error: dbError } = await supabase
        .from('leads')
        .insert([leadData]);

    if (dbError) {
        console.error('❌ Database Insert Failed:', dbError);
        return;
    }

    console.log('✅ Lead Saved to Database');

    // 2. Trigger Email Function
    console.log('📧 Triggering Email Function...');
    const { data: funcData, error: funcError } = await supabase.functions.invoke('send-email', {
        body: { record: leadData }
    });

    if (funcError) {
        console.error('❌ Email Function Failed:', funcError);
    } else {
        console.log('✅ Email Function Response:', funcData);
    }
}

createLead();
