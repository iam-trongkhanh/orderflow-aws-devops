import assert from 'node:assert/strict';
const base=(process.env.BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/,'');
async function request(path,options){return fetch(base+path,{...options,signal:AbortSignal.timeout(10000)});}
for(const path of ['/healthz','/readyz'])assert.equal((await request(path)).status,200,path);
const response=await request('/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({item_name:'deployment-smoke-test',quantity:1})});
assert.equal(response.status,201);const order=await response.json();
assert.deepEqual(await (await request(`/orders/${order.id}`)).json(),order);
assert.equal((await request('/orders/00000000-0000-4000-8000-000000000000')).status,404);
console.log(`Smoke test passed; retained test order ${order.id}`);
