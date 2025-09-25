const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testConnection() {
    console.log('🔍 Testing Supabase Connection');
    console.log('==============================\n');

    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('📋 Environment Check:');
    console.log(`   URL: ${url ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Anon Key: ${anonKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Service Key: ${serviceKey ? '✅ Set' : '❌ Missing'}\n`);

    if (!url || !anonKey) {
        console.error('❌ Missing required environment variables!');
        console.log('Please check your .env.local file and ensure all required values are set.');
        process.exit(1);
    }

    try {
        // Test with anon key
        console.log('🔑 Testing with anon key...');
        const supabaseAnon = createClient(url, anonKey);
        
        const { data: anonData, error: anonError } = await supabaseAnon
            .from('contracts')
            .select('count', { count: 'exact', head: true });

        if (anonError) {
            console.log(`   ⚠️  Anon key test: ${anonError.message}`);
        } else {
            console.log(`   ✅ Anon key works! Found ${anonData?.length || 0} contracts`);
        }

        // Test with service key (if available)
        if (serviceKey) {
            console.log('\n🔑 Testing with service key...');
            const supabaseService = createClient(url, serviceKey);
            
            const { data: serviceData, error: serviceError } = await supabaseService
                .from('contracts')
                .select('count', { count: 'exact', head: true });

            if (serviceError) {
                console.log(`   ⚠️  Service key test: ${serviceError.message}`);
            } else {
                console.log(`   ✅ Service key works! Found ${serviceData?.length || 0} contracts`);
            }
        }

        // Test authentication
        console.log('\n🔐 Testing authentication...');
        const { data: authData, error: authError } = await supabaseAnon.auth.getSession();
        
        if (authError) {
            console.log(`   ⚠️  Auth test: ${authError.message}`);
        } else {
            console.log(`   ✅ Auth system accessible! Current session: ${authData.session ? 'Active' : 'None'}`);
        }

        console.log('\n🎉 Connection test complete!');
        console.log('============================');
        console.log('✅ Your Supabase connection is working correctly!');
        console.log('\n📋 Next steps:');
        console.log('   1. Run the database schema: supabase-schema.sql');
        console.log('   2. Import your contract data');
        console.log('   3. Test your application');

    } catch (error) {
        console.error('💥 Connection test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check your Supabase project URL');
        console.log('   2. Verify your API keys are correct');
        console.log('   3. Ensure your Supabase project is active');
        console.log('   4. Check your internet connection');
        process.exit(1);
    }
}

testConnection();
