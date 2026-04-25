const fetch = require('node-fetch');

const API_BASE = 'https://kinaja.toolpdf.org/api';

async function run() {
  console.log('Logging in as Driver 58...');
  const loginRes = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ identifier: '413-395-2414', password: 'password' })
  });
  
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed:', loginData);
    return;
  }
  
  const token = loginData.token;
  console.log('Logged in! Token:', token);

  console.log('Sending toggle-online...');
  await fetch(`${API_BASE}/driver/toggle-online`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });

  console.log('Fetching available orders...');
  const availRes = await fetch(`${API_BASE}/driver/available-orders`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const availText = await availRes.text();
  console.log('Available orders raw:', availText);
  
  try {
    const avail = JSON.parse(availText);
    const orders = avail.data || avail;
    if (orders && orders.length > 0) {
      console.log(`Found ${orders.length} available orders. Trying to accept order ${orders[0].id}...`);
      const acceptRes = await fetch(`${API_BASE}/driver/orders/${orders[0].id}/accept`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const acceptData = await acceptRes.json();
      console.log('Accept result:', acceptData);
    } else {
      console.log('No available orders to accept. Let me try accepting Order ID 104 as a fallback...');
      const fallbackRes = await fetch(`${API_BASE}/driver/orders/104/accept`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      console.log('Fallback accept result:', await fallbackRes.text());
    }
  } catch (e) {
    console.error('Failed to parse or accept:', e);
  }
}

run();
