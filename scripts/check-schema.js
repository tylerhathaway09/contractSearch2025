const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function checkSchema() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Checking actual database schema...\n');

    // Try to get the table structure by attempting to select with specific columns
    const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Sample record structure:');
        console.log(data[0] || 'No records found');

        if (data[0]) {
            console.log('\nActual columns in database:');
            console.log(Object.keys(data[0]).join(', '));
        }
    }
}

checkSchema();
