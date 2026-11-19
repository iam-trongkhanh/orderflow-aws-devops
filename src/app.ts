import Fastify, { LogController } from 'fastify';
import { randomUUID } from 'node:crypto';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import type pg from 'pg';
import type { Config } from './config.js';
import { createPool } from './db.js';

export function buildApp(c: Config, pool: pg.Pool = createPool(c), logging = true) {
  const app = Fastify({ logger: logging ? { level:c.logLevel,
    serializers: { req: req => ({ method:req.method }), err: error => ({ type:error.name, code:error.code, message:"Operation failed", stack:"" }) },
    redact:['req.headers.authorization','req.headers.cookie','DATABASE_URL'] } : false,
    logController:new LogController({disableRequestLogging:true}), genReqId:() => randomUUID(), bodyLimit:16384,
    requestTimeout:15000, connectionTimeout:10000, keepAliveTimeout:5000,
    ajv:{ customOptions:{ coerceTypes:false, removeAdditional:false } } });
  let stopping = false;
  const registry = new Registry();
  collectDefaultMetrics({ register:registry, prefix:'orderflow_' });
  const labels = ['method','route','status_code'] as const;
  const requests = new Counter({name:'http_requests_total',help:'Completed HTTP requests',labelNames:labels,registers:[registry]});
  const duration = new Histogram({name:'http_request_duration_seconds',help:'HTTP latency seconds',labelNames:labels,
    buckets:[0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5,10],registers:[registry]});
  for (const state of ['total','idle','waiting'] as const) {
    new Gauge({name:`pg_pool_${state}`,help:`Pool ${state} connections or waiters`,registers:[registry],
      collect() { this.set(state === 'total' ? pool.totalCount : state === 'idle' ? pool.idleCount : pool.waitingCount); }});
  }
  const poolError = (error: Error & {code?:string}) => app.log.error({err:error},'Idle database connection failed');
  pool.on('error',poolError);
  app.addHook('onRequest',async (req,reply) => { reply.header('x-request-id',req.id); });
  app.addHook('onResponse',async (req,reply) => {
    const values = {method:['GET','POST','HEAD','PUT','PATCH','DELETE','OPTIONS'].includes(req.method) ? req.method : 'OTHER',
      route:req.routeOptions.url ?? 'unmatched',status_code:String(reply.statusCode)};
    requests.inc(values); duration.observe(values,reply.elapsedTime/1000);
    req.log.info({request_id:req.id,method:req.method,route:values.route,status:reply.statusCode,duration_ms:reply.elapsedTime},'Request completed');
  });
  app.addHook('preClose',async () => { stopping = true; });
  app.addHook('onClose',async () => { await pool.end(); pool.off('error',poolError); registry.clear(); });
  app.setErrorHandler((error,req,reply) => {
    const err = error as Error & {validation?:unknown;statusCode?:number;code?:string};
    if (err.validation || (err.statusCode && err.statusCode < 500)) {
      return reply.code(err.statusCode ?? 400).send({error:'Invalid request',request_id:req.id});
    }
    req.log.error({err},'Request failed');
    const unavailable = err.code?.startsWith('08') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','57P01','57P02','57P03','53300'].includes(err.code ?? '') || /timeout|connection terminated/i.test(err.message);
    return reply.code(unavailable ? 503 : 500).send({error:unavailable ? 'Service unavailable' : 'Internal server error',request_id:req.id});
  });
  app.get('/healthz',async () => ({status:'ok'}));
  app.get('/readyz',async (_req,reply) => {
    if (stopping) return reply.code(503).send({status:'unavailable'});
    try { await pool.query('SELECT id, item_name, quantity, created_at FROM orders LIMIT 0'); return {status:'ready'}; }
    catch { return reply.code(503).send({status:'unavailable'}); }
  });
  app.get('/metrics',async (_req,reply) => reply.type(registry.contentType).send(await registry.metrics()));
  const orderSchema = {type:'object',additionalProperties:false,required:['item_name','quantity'],properties:{
    item_name:{type:'string',minLength:1,maxLength:200,pattern:'\\S'},quantity:{type:'integer',minimum:1,maximum:1000000}}};
  app.post<{Body:{item_name:string;quantity:number}}>('/orders',{schema:{body:orderSchema}},async (req,reply) => {
    const id = randomUUID();
    const result = await pool.query('INSERT INTO orders(id,item_name,quantity) VALUES ($1,$2,$3) RETURNING *',[id,req.body.item_name.trim(),req.body.quantity]);
    return reply.code(201).header('location',`/orders/${id}`).send(result.rows[0]);
  });
  app.get<{Params:{id:string}}>('/orders/:id',{schema:{params:{type:'object',required:['id'],properties:{id:{type:'string',pattern:'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'}}}}},async (req,reply) => {
    const result = await pool.query('SELECT * FROM orders WHERE id=$1',[req.params.id]);
    return result.rows[0] ?? reply.code(404).send({error:'Order not found'});
  });
  return app;
}
