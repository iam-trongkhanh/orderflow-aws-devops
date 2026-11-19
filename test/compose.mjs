import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const project=`orderflow-verify-${randomUUID().slice(0,8)}`;
const env={...process.env,POSTGRES_PASSWORD:randomUUID()};
const compose=(...args)=>execFileSync('docker',['compose','--env-file','.env.example','-p',project,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const base='http://127.0.0.1:8080';
async function ready(){for(let i=0;i<100;i++){try{if((await fetch(base+'/readyz',{signal:AbortSignal.timeout(4000)})).ok)return;}catch{}await delay(300);}throw new Error('Readiness timed out');}
try {
  compose('config','--quiet');
  compose('up','--build','-d'); await ready();
  const id=compose('ps','-q','api');
  const user=execFileSync('docker',['exec',id,'id','-u'],{encoding:'utf8'}).trim(); assert.notEqual(user,'0');
  const response=await fetch(base+'/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({item_name:'compose persistence',quantity:1})});
  assert.equal(response.status,201); const order=await response.json();
  compose('stop','db');
  assert.equal((await fetch(base+'/healthz')).status,200);
  assert.equal((await fetch(base+'/readyz')).status,503);
  compose('start','db'); await ready();
  compose('down'); compose('up','-d'); await ready();
  assert.deepEqual(await (await fetch(base+`/orders/${order.id}`)).json(),order);
  execFileSync(process.execPath,['scripts/smoke.mjs'],{env:{...env,BASE_URL:base},stdio:'inherit'});
  assert.match(await (await fetch(base+'/metrics')).text(),/http_requests_total/);
  for(let i=0;i<30;i++){
    const status=execFileSync('docker',['inspect','--format','{{.State.Health.Status}}',compose('ps','-q','api')],{encoding:'utf8'}).trim();
    if(status==='healthy')break;
    assert.notEqual(i,29,'Docker health check never became healthy');await delay(500);
  }
  assert.ok(!compose('logs','api').includes(env.POSTGRES_PASSWORD));
  console.log('Compose verified: non-root runtime, health check, migrations, outage recovery, volume persistence, smoke and metrics');
} finally {
  // This random project and its volume are created exclusively by this script.
  compose('down','--volumes','--remove-orphans');
}
