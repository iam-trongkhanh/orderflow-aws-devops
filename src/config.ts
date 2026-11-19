export function config(env = process.env) {
  const integer = (key: string, fallback: number, max = 2147483647) => {
    const value = Number(env[key] ?? fallback);
    if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`Invalid ${key}`);
    return value;
  };
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const url = new URL(env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid DATABASE_URL protocol');
  const logLevel = env.LOG_LEVEL ?? 'info';
  if (!['fatal','error','warn','info','debug','trace','silent'].includes(logLevel)) throw new Error('Invalid LOG_LEVEL');
  return { databaseUrl: env.DATABASE_URL, host: env.HOST ?? '0.0.0.0', port: integer('PORT',8080,65535), logLevel,
    poolMax: integer('DB_POOL_MAX',10,100), connectTimeout: integer('DB_CONNECT_TIMEOUT_MS',2000),
    queryTimeout: integer('DB_QUERY_TIMEOUT_MS',3000), shutdownTimeout: integer('SHUTDOWN_TIMEOUT_MS',10000) };
}
export type Config = ReturnType<typeof config>;
