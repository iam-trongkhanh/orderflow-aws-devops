import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
// Dedicated, disposable database container; never touches Compose data.
const name=`orderflow-test-${randomUUID()}`;
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
async function until(fn) { for(let i=0;i<100;i++){try{const v=await fn();if(v)return v;}catch{} await delay(200);} throw new Error('Timed out waiting for service'); }
test('real PostgreSQL persistence, outage/recovery and process signals',{timeout:120000},async t=>{
  const reservation=createServer();
  await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
  const dbPort=reservation.address().port;
  await new Promise(resolve=>reservation.close(resolve));
  docker('run','-d','--name',name,'-e','POSTGRES_PASSWORD=test-only','-e','POSTGRES_DB=orderflow','-p',`127.0.0.1:${dbPort}:5432`,'postgres:17-bookworm');
  let child;
  t.after(async()=>{ if(child && child.exitCode===null){child.kill('SIGKILL');await once(child,'exit');} docker('rm','-f','-v',name); });
  await until(()=>docker('exec',name,'pg_isready','-h','127.0.0.1','-U','postgres'));
  const port=docker('port',name,'5432/tcp').split(':').at(-1);
  const env={...process.env,DATABASE_URL:`postgres://postgres:test-only@127.0.0.1:${port}/orderflow`,PORT:'18081',HOST:'127.0.0.1',LOG_LEVEL:'silent'};
  execFileSync(process.execPath,['dist/migrate.js'],{env}); execFileSync(process.execPath,['dist/migrate.js'],{env});
  const base='http://127.0.0.1:18081';
  const start=async()=>{child=spawn(process.execPath,['dist/server.js'],{env,stdio:'ignore'}); await until(async()=>(await fetch(base+'/readyz')).ok);};
  const stop=async(signal)=>{const exited=once(child,'exit');child.kill(signal);const [code]=await exited;assert.equal(code,0);};
  await start();
  const response=await fetch(base+'/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({item_name:'persistent',quantity:3})});
  assert.equal(response.status,201); const row=await response.json();
  // Hold a real request in PostgreSQL while sending SIGTERM; it must drain.
  const admin=new pg.Client({connectionString:env.DATABASE_URL}); await admin.connect();
  try {
    await admin.query('BEGIN'); await admin.query('LOCK TABLE orders IN ACCESS EXCLUSIVE MODE');
    const inFlight=fetch(base+`/orders/${row.id}`);
    await until(async()=> (await admin.query("SELECT 1 FROM pg_stat_activity WHERE application_name='orderflow' AND wait_event_type='Lock'")).rowCount>0);
    const exited=once(child,'exit'); child.kill('SIGTERM');
    await delay(100); await admin.query('COMMIT');
    assert.equal((await inFlight).status,200);
    assert.equal((await exited)[0],0);
  } finally { await admin.end(); }
  await start();
  assert.deepEqual(await (await fetch(base+`/orders/${row.id}`)).json(),row);
  docker('stop','-t','1',name);
  assert.equal((await fetch(base+'/healthz')).status,200);
  assert.equal((await fetch(base+'/readyz')).status,503);
  assert.equal((await fetch(base+`/orders/${row.id}`)).status,503);
  docker('start',name); await until(async()=>(await fetch(base+'/readyz')).ok);
  assert.equal((await fetch(base+`/orders/${row.id}`)).status,200);
  await stop('SIGINT');
});
