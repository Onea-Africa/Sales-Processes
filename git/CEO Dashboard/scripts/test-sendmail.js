const payload = {
  formType: 'Internet Service Providers',
  fullName: 'Integration Test Lead',
  email: 'test+isp@example.com',
  phone: '+27694644663',
  service: 'Internet Service Providers',
  selectedPackage: 'Supersonic 100 Mbps',
  packagePrice: '749',
  address: '123 Test Drive, Cape Town',
  ispPartner: 'PartnerCo',
  speed: '100 Mbps',
  monthlyValue: '749',
  message: 'Please contact me about ISP options.',
};

const url = process.argv[2] || 'http://127.0.0.1:8000/sendmail.php';
console.log(`Posting test ISP payload to ${url}`);

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then(async res => {
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Response:', text);
  })
  .catch(err => {
    console.error('Request failed:', err);
    process.exit(1);
  });
