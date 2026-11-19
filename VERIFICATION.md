# Verification record

Executed on 4 November 2026 (Asia/Ho_Chi_Minh) in the project workspace.

## Environment preparation

The host initially had no Node.js/npm and Docker Desktop was stopped. Started Docker Desktop with `open -a Docker`. Downloaded Node.js 26.13.0 for Darwin arm64 to `/tmp`, and verified SHA-256 against the official SHASUMS256.txt (`d38bd5e5a2ddce6bbb5ce45e46e208337da4d51fffe611e567fd32073d6439f6`). The temporary runtime is not a system-wide Node installation.

Native npm commands below used `PATH=/tmp/node-v26.13.0-darwin-arm64/bin:$PATH`. Initial sandbox attempts to reach npm and the Docker socket failed; authorized executions succeeded.

## Commands and results

| Command | Result |
| --- | --- |
| `npm install --cache /tmp/orderflow-npm-cache --fetch-retries=0 --fetch-timeout=15000` | Installed dependencies and lockfile; audit reported 0 vulnerabilities |
| `docker pull node:26-bookworm-slim` | Succeeded |
| `docker pull postgres:17-bookworm` | Succeeded |
| `npm run typecheck` | Passed strict TypeScript checking |
| `npm test` | Passed 2 API/configuration tests; multiple assertions cover CRUD, validation, 404, readiness, liveness, metrics, and pool cleanup |
| `npm run test:integration` | Passed real PostgreSQL test: migrations applied twice, order persistence across API restart, outage/recovery without restart, SIGTERM draining a blocked request, SIGINT clean exit |
| `docker compose --env-file .env.example config --quiet` | Passed |
| `docker compose --env-file .env.example build` | Passed multi-stage image build, production dependency pruning; npm ci audit reported 0 vulnerabilities |
| `npm run test:compose` | Passed final image build/start, non-root UID, migrations, Docker health check, DB outage/recovery, named-volume persistence after container recreation, smoke script, metrics, credential exclusion from logs |
| `docker compose config --quiet` | Passed with generated local `.env` |

The Compose test invokes `node scripts/smoke.mjs` against its local stack; it passed. The integration test removes its uniquely named database container; the Compose test removes only its uniquely named project and test volumes. No existing infrastructure or data was changed. The regular application stack is not left running.

## Issues found and resolved

- Initial TypeScript check found a Fastify logger serializer type mismatch; corrected and rechecked.
- Initial integration recovery check failed because Docker reassigned an automatically allocated host port after container restart. The harness now selects a free port and publishes that explicit port; recovery passes.
- Replaced Fastify's deprecated request-logging option with its LogController API.

## Remaining limits

- `prom-client` 15.1.3 reports deprecation in favor of `@prometheus-io/client`. Kept the explicitly requested dependency; metrics tests pass.
- AWS execution, production TLS/authentication, monitoring infrastructure, load testing, and backup/restore are outside scope and unverified.
- Node.js is only provisioned in temporary storage for verification. Install Node.js 26 yourself for future native npm commands, or use Docker Compose for the application.
- A random local database password is stored in a mode-0600, git-ignored `.env`; it is excluded from the Docker build context. `.env.example` contains only placeholders.

## Start

From this project directory:

```sh
docker compose up --build -d
```

Then visit `http://127.0.0.1:8080/healthz` and `http://127.0.0.1:8080/readyz`.
