# <CASE-ID> — <short title>

Bank ID: <ID> · Status: `NOT_STARTED` · Env: <kind | AWS | simulated>

| Field | Value |
| --- | --- |
| Detected | <date time, timezone> |
| Recovered | <date time> |
| Layer | <DNS, edge, TLS, ALB, network, host, container, app, DB, IAM, CI/CD> |
| Impact | <who saw what, how many, how long> |
| Cost and safety | <cost of the drill, rollback plan, approval> |

## Baseline
Last known healthy state, the request path, and the identities involved.

## Symptom
What the client or operator saw, with the exact command and output.

## Signals
Metrics, logs, traces, events, with timestamps.

## Hypotheses and checks
Your hypothesis first. One row per hypothesis: the check you ran and what it ruled in or out. Work the layers in order: client → DNS → edge/WAF → TLS → ALB → route/SG/NACL → host/node → container/pod → service → app → credentials/DB.

## Root cause
Only once proven.

## Fix
Smallest change that works, why it works, and how to roll it back.

## Recovery verified
Re-run the exact path that failed. A green status alone is not proof.

## Prevention
Alert, test, policy or design change that stops a repeat.

## Interview drill
Two or three questions an interviewer would ask, with short answers, plus a three-sentence English explain-back.

## Evidence
File names from the evidence manifest. Redact account IDs, IPs and secrets before publishing.
