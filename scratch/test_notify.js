async function testNotify() {
  const payload = {
    policy_number: "PG-TEST-12345",
    amount: 226,
    coverage_type: "Basic",
    term: "1m",
    deductible: "1000",
    vin: "1HGCM82633A004352",
    vehicle: "2003 Honda Accord",
    license_class: "G",
    dob: "1995-05-15",
    postal: "M5V2T6",
    receipt_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    receipt_name: "test_receipt.png"
  };

  try {
    const res = await fetch('https://casite-pink.vercel.app/api/notify/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testNotify();
