const fetch = require('node-fetch');
const API_BASE = 'https://kinaja.toolpdf.org/api';

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function run() {
  console.log('-- 1. LOGIN AS CLIENT --');
  // Client ID 101: 445.440.9165 (Mr. Nathan Harvey)
  const clientData = await req('/login', 'POST', { identifier: '445.440.9165', password: 'password' });
  const clientToken = clientData.token;
  console.log('Client token:', clientToken?.substring(0, 10));

  console.log('\n-- 2. CREATE ORDER --');
  // Assume restaurant_id 1 exists (Owner ID 1)
  const orderRes = await req('/orders', 'POST', {
    restaurant_id: 1,
    delivery_fee: 500,
    delivery_address: 'Rua 4, Kilamba',
    latitude: -8.995, longitude: 13.250,
    items: [{ product_id: 1, quantity: 1 }]
  }, clientToken);
  console.log('Order created:', orderRes);
  const newOrderId = orderRes.id || (orderRes.data ? orderRes.data.id : null);

  console.log('\n-- 3. LOGIN AS RESTAURANT OWNER --');
  const restData = await req('/login', 'POST', { identifier: 'clair32@example.com', password: 'password' });
  const restToken = restData.token;
  console.log('Rest token:', restToken?.substring(0, 10));

  if (newOrderId && restToken) {
    console.log(`\n-- 4. RESTAURANT SET ORDER TO READY --`);
    await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'accepted' }, restToken);
    await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'preparing' }, restToken);
    const readyRes = await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'ready' }, restToken);
    console.log('Order marked as ready:', readyRes);
  } else {
    console.log('Failed to login as restaurant', restData);
  }

   console.log('\n-- 5. COMPLETE --');
   console.log('Order is now READY and unassigned. Your app (Driver 58) should pick it up automatically within 10 seconds via polling!');
}
run();
