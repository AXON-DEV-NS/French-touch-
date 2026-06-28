import fetch from 'node-fetch';

async function test() {
  const res = await fetch("http://localhost:3000/api/managers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": "oren.on.oren.25@gmail.com"
    },
    body: JSON.stringify({email: "test@test.com", name: "test", password: "123", lang: "ar"})
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
