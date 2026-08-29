async function testWorker() {
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  const body = "--" + boundary + "\r\n" +
    'Content-Disposition: form-data; name="file"; filename="test.png"\r\n' +
    'Content-Type: image/png\r\n\r\n' +
    'test\r\n' +
    "--" + boundary + "--\r\n";

  try {
    const res = await fetch('https://fan-art-upload.safarser3.workers.dev/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer dummy_token_123'
      },
      body: body
    });
    console.log('POST status:', res.status);
    console.log('POST response:', await res.text());
  } catch(e) {
    console.log('POST error', e);
  }
}
testWorker();
