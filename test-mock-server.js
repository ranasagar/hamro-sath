import http from 'http';

http
  .get('http://localhost:3002/api/health', res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('✅ Mock server is responding!');
      console.log('Response:', data);
      process.exit(0);
    });
  })
  .on('error', err => {
    console.error('❌ Mock server is NOT responding:', err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.error('❌ Timeout - server not responding');
  process.exit(1);
}, 5000);
