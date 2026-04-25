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
  console.log('\n-- 1. LOGIN AS RESTAURANT OWNER --');
  // Owner ID 1 (Email: clair32@example.com for Blanda Inc)
  const restData = await req('/login', 'POST', { identifier: 'clair32@example.com', password: 'password' });
  const restToken = restData.token;

  if (!restToken) {
    console.error('Failed to log in as restaurant:', restData);
    return;
  }
  
  console.log('Logged in successfully!');

  // Fetch orders for the restaurant
  // The backend might not have a direct restaurant-only order list endpoint without knowing the admin/restaurant role.
  // Actually, we can get the orders for the restaurant using GET /orders if the backend filters by role!
  const ordersResponse = await req('/orders', 'GET', null, restToken);
  
  let orders = [];
  if (Array.isArray(ordersResponse)) orders = ordersResponse;
  else if (ordersResponse && Array.isArray(ordersResponse.data)) orders = ordersResponse.data;
  else if (ordersResponse && ordersResponse.data && Array.isArray(ordersResponse.data.data)) orders = ordersResponse.data.data;
  else {
      console.log('Hmm, weird orders format:', ordersResponse);
  }

  // Find the latest pending order
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  if (pendingOrders.length === 0) {
      console.log('No pending orders found! Searching for order ID...');
      // What if the user didn't create a pending order, or we can't see it?
      console.log('Let us assume it is the last one in the list.');
      if (orders.length > 0) {
          const lastOrder = orders[orders.length - 1];
          console.log('Last order is:', lastOrder);
      }
      return;
  }

  // Take the most recently created pending order (assuming higher ID = more recent)
  const targetOrder = pendingOrders.sort((a,b) => b.id - a.id)[0];
  const newOrderId = targetOrder.id;
  
  console.log(`\n-- 2. RESTAURANT IS PREPARING ORDER ${newOrderId} --`);
  await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'accepted' }, restToken);
  await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'preparing' }, restToken);
  const readyRes = await req(`/orders/${newOrderId}/status`, 'PATCH', { status: 'ready' }, restToken);
  
  console.log('Order is now READY for the driver:', readyRes);
}
run();
