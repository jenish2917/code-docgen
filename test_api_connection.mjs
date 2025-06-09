import fetch from 'node-fetch';

async function testApiConnection() {
    console.log('Testing API Connection to Django Backend...');
    
    try {
        console.log('Connecting to http://localhost:8000/api/ai-status/');
        const response = await fetch('http://localhost:8000/api/ai-status/');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Connected to backend API');
            console.log('API Response:', JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log('❌ ERROR: Backend API responded with status', response.status);
            console.log('Response text:', await response.text());
            return false;
        }
    } catch (error) {
        console.log('❌ ERROR: Could not connect to the backend server');
        console.log('Error details:', error.message);
        return false;
    }
}

testApiConnection();
