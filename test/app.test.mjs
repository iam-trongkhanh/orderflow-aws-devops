import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { buildApp } from '../dist/app.js';
import { config } from '../dist/config.js';
class FakePool extends EventEmitter {
  totalCount=0; idleCount=0; waitingCount=0; down=false; ended=false; rows=new Map();
  async query(sql,args) {
    if(this.down) throw Object.assign(new Error('offline'),{code:'ECONNREFUSED'});
    if(sql.startsWith('INSERT')) { const row={id:args[0],item_name:args[1],quantity:args[2],created_at:new Date().toISOString()}; this.rows.set(row.id,row); return {rows:[row]}; }
    return {rows:args ? [this.rows.get(args[0])].filter(Boolean) : []};
  }
  async end(){this.ended=true;}
}
const c=config({DATABASE_URL:'postgres://test:test@localhost/test'});
test('API contract, validation, normalized metrics and failure recovery',async t=>{
  const pool=new FakePool(); const app=buildApp(c,pool,false); t.after(()=>app.close());
  assert.equal((await app.inject('/healthz')).statusCode,200);
  assert.equal((await app.inject('/readyz')).statusCode,200);
  const created=await app.inject({method:'POST',url:'/orders',payload:{item_name:' Book ',quantity:2}});
  assert.equal(created.statusCode,201); const row=created.json(); assert.equal(row.item_name,'Book');
  assert.deepEqual((await app.inject(`/orders/${row.id}`)).json(),row);
  assert.equal((await app.inject('/orders/00000000-0000-4000-8000-000000000000')).statusCode,404);
  assert.equal((await app.inject('/orders/nope')).statusCode,400);
  for(const body of [{},{item_name:' ',quantity:1},{item_name:'x',quantity:0},{item_name:'x',quantity:'2'},{item_name:'x',quantity:1,extra:true},{item_name:'x'.repeat(201),quantity:1}]) {
    assert.equal((await app.inject({method:'POST',url:'/orders',payload:body})).statusCode,400);
  }
  pool.down=true;
  assert.equal((await app.inject('/healthz')).statusCode,200);
  assert.equal((await app.inject('/readyz')).statusCode,503);
  assert.equal((await app.inject(`/orders/${row.id}`)).statusCode,503);
  pool.emit('error',new Error('offline'));
  pool.down=false; assert.equal((await app.inject('/readyz')).statusCode,200);
  const metrics=await app.inject('/metrics'); assert.equal(metrics.statusCode,200);
  assert.match(metrics.body,/http_request_duration_seconds_bucket/);
  assert.match(metrics.body,/status_code="503"/); assert.match(metrics.body,/orderflow_process_cpu/);
  assert.match(metrics.body,/pg_pool_total/); assert.ok(!metrics.body.includes(row.id));
  await app.close(); assert.equal(pool.ended,true);
});
test('configuration rejects invalid values',()=>{
  assert.throws(()=>config({})); assert.throws(()=>config({DATABASE_URL:c.databaseUrl,PORT:'bad'}));
});
