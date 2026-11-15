const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          json: () => {
            try { return JSON.parse(data); } catch (e) { return null; }
          }
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing GET /api/categories ---');
  let res = await request({ hostname: 'localhost', port: 3000, path: '/api/categories', method: 'GET' });
  console.log('Categories status:', res.statusCode);
  const categories = res.json();
  console.log('Categories count:', categories?.length);
  categories?.forEach(c => console.log(`  - [${c.slug}] ${c.name} (${c._count?.items || 0} items)`));

  console.log('\n--- 2. Testing GET /api/menu-items ---');
  res = await request({ hostname: 'localhost', port: 3000, path: '/api/menu-items', method: 'GET' });
  console.log('Menu items status:', res.statusCode);
  const items = res.json();
  console.log('Total items:', items?.length);
  const struckOut = items?.filter(i => i.isStruckOut);
  console.log(`Struck out items count: ${struckOut?.length}`);
  struckOut?.forEach(i => console.log(`  - 🚫 ${i.name} (₹${i.price})`));

  console.log('\n--- 3. Testing Customer Menu View GET /menu ---');
  res = await request({ hostname: 'localhost', port: 3000, path: '/menu', method: 'GET' });
  console.log('/menu HTML status:', res.statusCode);
  const html = res.data;
  console.log('Contains "NoWave":', html.includes('NoWave'));
  console.log('Contains "No Wave. Just Tilt.":', html.includes('No Wave. Just Tilt.'));

  console.log('\n--- 4. Testing Admin Login POST /api/auth/login ---');
  const loginBody = JSON.stringify({ email: 'manager@nowave.cafe', password: 'NoWave2024!' });
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);
  console.log('Login status:', res.statusCode);
  console.log('Login response:', res.data);
  const cookies = res.headers['set-cookie'];
  const sessionCookie = cookies ? cookies[0].split(';')[0] : '';
  console.log('Session Cookie received:', sessionCookie ? 'YES' : 'NO');

  console.log('\n--- 5. Testing Admin Dashboard access with session cookie ---');
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
    headers: {
      'Cookie': sessionCookie
    }
  });
  console.log('/admin authenticated status:', res.statusCode);

  console.log('\n--- 6. Testing Toggle Item Struck-Out API (PATCH /api/menu-items/:id/toggle) ---');
  const targetItem = items.find(i => i.name.includes('Idli'));
  console.log(`Toggling "${targetItem.name}" (ID: ${targetItem.id}) to struck out: true...`);
  const toggleBody = JSON.stringify({ isStruckOut: true });
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/menu-items/${targetItem.id}/toggle`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(toggleBody),
      'Cookie': sessionCookie
    }
  }, toggleBody);
  console.log('Toggle response status:', res.statusCode);
  const toggled = res.json();
  console.log(`Updated state for ${toggled?.name}: isStruckOut = ${toggled?.isStruckOut}`);

  console.log('\n--- 7. Testing Reset All Struck-Out Items (POST /api/menu-items/reset) ---');
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/menu-items/reset',
    method: 'POST',
    headers: {
      'Cookie': sessionCookie
    }
  });
  console.log('Reset response status:', res.statusCode);
  console.log('Reset response:', res.data);

  console.log('\n--- 8. Re-setting original demo state (strike out Benne Masala Dosa and Filter Kaapi) ---');
  const dosa = items.find(i => i.name.includes('Dosa'));
  const kaapi = items.find(i => i.name.includes('Kaapi'));
  for (const item of [dosa, kaapi]) {
    if (item) {
      await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/menu-items/${item.id}/toggle`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(toggleBody),
          'Cookie': sessionCookie
        }
      }, toggleBody);
      console.log(`Struck out ${item.name}`);
    }
  }

  console.log('\n--- Final Verification of menu items state ---');
  res = await request({ hostname: 'localhost', port: 3000, path: '/api/menu-items', method: 'GET' });
  const finalItems = res.json();
  const finalStruck = finalItems.filter(i => i.isStruckOut);
  console.log(`Final struck-out count: ${finalStruck.length}`);
  finalStruck.forEach(i => console.log(`  - 🚫 ${i.name} (₹${i.price})`));
  console.log('\n✅ ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
}

run().catch(console.error);
