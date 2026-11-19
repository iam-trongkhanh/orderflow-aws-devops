import { config } from './config.js';
import { buildApp } from './app.js';
async function main() {
  const c = config();
  const app = buildApp(c);
  let closing = false;
  for (const signal of ['SIGTERM','SIGINT'] as const) process.on(signal,() => {
    if (closing) return;
    closing = true;
    app.log.info({signal},'Shutting down');
    const deadline = setTimeout(() => { app.log.fatal('Shutdown deadline exceeded'); process.exit(1); },c.shutdownTimeout);
    deadline.unref();
    void app.close().then(() => { clearTimeout(deadline); app.log.info('Shutdown complete'); })
      .catch(() => { clearTimeout(deadline); process.exitCode=1; });
  });
  try { await app.listen({host:c.host,port:c.port}); }
  catch { app.log.fatal('Unable to listen'); await app.close(); process.exitCode=1; }
}
main().catch(() => { console.error('Startup failed; check configuration'); process.exitCode=1; });
