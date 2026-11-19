# Incident index

393 training scenarios across 20 fault domains: the original 210-case bank (Kubernetes cases renamed `K8SI-` so they do not clash with the `K8S-001..007` learning modules), IAM-019 from a real incident, and expanded coverage from the 2026-11-19 roadmap. It is a catalogue, not a to-do list: a case is worked when it teaches something new, and every worked case gets its own write-up from the [template](TEMPLATE.md).

| Status | Meaning |
| --- | --- |
| `RECOVERED_PASS` | Real failure, root cause proven, recovery re-tested |
| `VERIFIED_LOCAL / VERIFIED_AWS_EC2 / VERIFIED_EKS` | Reproduced and verified with output in that environment |
| `PARTIAL_LOCAL` | Part of the scenario verified locally |
| `PRACTICED` | Done in a lab; evidence incomplete |
| `THEORY_LEARNED` | Studied and reasoned through, not reproduced |
| `SELF_REPORTED` | Fix reported without output |
| `NOT_STARTED` | Not attempted |

A pass in one environment says nothing about another: `VERIFIED_LOCAL` on kind is not `VERIFIED_EKS`.

| Domain | Cases | Roadmap phases |
| --- | --- | --- |
| [NET](#net) Networking, Linux, VPC, DNS, TCP, TLS | 22 | P1/P5 |
| [EDGE](#edge) Cloudflare, WAF, DDoS mitigation, origin protection | 22 | P4/P8 |
| [DOCKER](#docker) Containers, runtime, delivery | 14 | P1/P3 |
| [K8SI](#k8si) Kubernetes workloads | 32 | P6 |
| [EKS](#eks) AWS EKS operations | 28 | P7/P8 |
| [DB](#db) RDS PostgreSQL, data, recovery | 20 | P1/P8 |
| [IAM](#iam) AWS identity, secrets, access | 26 | P1/P9 |
| [CICD](#cicd) Git, pipelines, GitOps, releases | 16 | P3 |
| [OBS](#obs) Observability, on-call | 18 | P2/P8 |
| [REL](#rel) Reliability, scaling, FinOps | 20 | P8/P10 |
| [SYS](#sys) Linux systems | 18 | P1/P5 |
| [TF](#tf) Terraform and IaC operations | 18 | P5 |
| [FIN](#fin) FinOps | 22 | P2/P10 |
| [SEC](#sec) Security and DevSecOps | 22 | P4/P9 |
| [SUPPLY](#supply) Software supply chain | 15 | P3/P9 |
| [PERF](#perf) Performance | 18 | P2/P8 |
| [PLAT](#plat) Platform engineering | 15 | P11 |
| [DR](#dr) Disaster recovery | 15 | P8 |
| [APP](#app) Application operations | 20 | P1/P5 |
| [DATA](#data) Data integrity | 12 | P1/P8 |

## NET

Networking, Linux, VPC, DNS, TCP, TLS · phases P1/P5

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| NET-001 | Client DNS resolves to stale IP after Cloudflare nameserver migration | — | `NOT_STARTED` |  |
| NET-002 | A record points to wrong ALB; CNAME flattening/TTL misunderstood | — | `NOT_STARTED` |  |
| NET-003 | Split DNS or wrong resolver makes instance reach different endpoint | — | `NOT_STARTED` |  |
| NET-004 | ACM certificate correct but TLS 525/526 or SNI/Host mismatch | — | `NOT_STARTED` |  |
| NET-005 | ALB 404 host rule vs 502 backend vs 503 no target/healthy capacity | — | `NOT_STARTED` |  |
| NET-006 | Public subnet missing 0.0.0.0/0 → IGW route | — | `NOT_STARTED` |  |
| NET-007 | Private subnet missing NAT/endpoint egress path | — | `NOT_STARTED` |  |
| NET-008 | S3 Gateway Endpoint attached to wrong route table; prefix route absent | AWS | `PRACTICED` | AWS-001: route and prefix-list diagnosis, plan; no live traffic test (EVIDENCE_MISSING) |
| NET-009 | Private subnet association silently uses main route table | — | `NOT_STARTED` |  |
| NET-010 | Security Group inbound allows wrong source CIDR; timeout | — | `NOT_STARTED` |  |
| NET-011 | Security Group outbound denies required target/port | — | `NOT_STARTED` |  |
| NET-012 | NACL stateless return ephemeral port denied; asymmetric timeout | — | `NOT_STARTED` |  |
| NET-013 | Connection refused vs timeout vs DNS failure triage | — | `NOT_STARTED` |  |
| NET-014 | Route longest-prefix-match / conflicting prefix and endpoint paths | — | `NOT_STARTED` |  |
| NET-015 | Packet path through ALB→EC2→RDS vs direct public-IP bypass | — | `NOT_STARTED` |  |
| NET-016 | IPv6 AAAA published without working IPv6 path | — | `NOT_STARTED` |  |
| NET-017 | MTU / PMTUD blackhole between overlay and cloud network | — | `NOT_STARTED` |  |
| NET-018 | Connection tracking/SNAT exhaustion and intermittent drops | — | `NOT_STARTED` |  |
| NET-019 | DNS CoreDNS caching and negative cache causing stale service resolution | — | `NOT_STARTED` |  |
| NET-020 | Cross-AZ traffic path, latency and data-transfer costs | — | `NOT_STARTED` |  |
| NET-021 | EC2 public IP rotates after restart/replacement and client origin breaks | — | `NOT_STARTED` |  |
| NET-022 | VPC Flow Logs show ACCEPT but application still times out | — | `NOT_STARTED` |  |

## EDGE

Cloudflare, WAF, DDoS mitigation, origin protection · phases P4/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| EDGE-001 | Layer 3/4 volumetric threat model and upstream mitigation playbook (no actual flood) | — | `NOT_STARTED` |  |
| EDGE-002 | Layer 7 HTTP flood signs: requests, unique IPs, URLs, user-agent diversity, traffic anomalies | — | `NOT_STARTED` |  |
| EDGE-003 | Cloudflare managed WAF rule false positive blocks legitimate API | — | `NOT_STARTED` |  |
| EDGE-004 | Rate limiting too strict for legitimate clients; 429 versus 403 | — | `NOT_STARTED` |  |
| EDGE-005 | Rate limiting too weak; origin latency/5xx increase on benign test traffic | — | `NOT_STARTED` |  |
| EDGE-006 | Bot protection blocks API clients or health checks unexpectedly | — | `NOT_STARTED` |  |
| EDGE-007 | Cloudflare 521 origin refused / ALB listener-security mismatch | — | `NOT_STARTED` |  |
| EDGE-008 | Cloudflare 522 connection timeout, SG or network issue | — | `NOT_STARTED` |  |
| EDGE-009 | Cloudflare 525/526 TLS handshake/validation failure | — | `NOT_STARTED` |  |
| EDGE-010 | Cloudflare 502/504 vs ALB 502/504, identifying which proxy failed | — | `NOT_STARTED` |  |
| EDGE-011 | Cloudflare proxy orange vs DNS-only gray changes actual request source IP | — | `NOT_STARTED` |  |
| EDGE-012 | ALB origin accessible directly, bypassing Cloudflare WAF | — | `NOT_STARTED` |  |
| EDGE-013 | Origin access controls: authenticated pull / secret header / private connectivity trade-offs | — | `NOT_STARTED` |  |
| EDGE-014 | WAF rule ordering and priority prevent intended allow/deny | — | `NOT_STARTED` |  |
| EDGE-015 | Cache returns stale API response; unsafe caching of personalized content | — | `NOT_STARTED` |  |
| EDGE-016 | Cache miss storm spikes database load; cache-control strategy | — | `NOT_STARTED` |  |
| EDGE-017 | DNSSEC/DS mismatch causes SERVFAIL after nameserver changes | — | `NOT_STARTED` |  |
| EDGE-018 | Cloudflare Access policy denies valid user or allows unintended app route | — | `NOT_STARTED` |  |
| EDGE-019 | TLS Full(strict) changes affect other hostnames in shared zone | — | `NOT_STARTED` |  |
| EDGE-020 | DDoS incident runbook: contain, alert, sample traffic, escalate and recover | — | `NOT_STARTED` |  |
| EDGE-021 | WAF audit logging insufficient: apparent block without evidence | — | `NOT_STARTED` |  |
| EDGE-022 | CDN analytics vs ALB metrics mismatched due to caching and retries | — | `NOT_STARTED` |  |

## DOCKER

Containers, runtime, delivery · phases P1/P3

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| DOCKER-001 | Mac arm64 image deployed to amd64 EC2 raises exec format error | — | `NOT_STARTED` |  |
| DOCKER-002 | ECR authorization failed due to missing role/pull permissions | — | `NOT_STARTED` |  |
| DOCKER-003 | Immutable ECR tag already exists after retry; use unique SHA | — | `NOT_STARTED` |  |
| DOCKER-004 | Compose bind 127.0.0.1 prevents ALB private-IP health check | — | `NOT_STARTED` |  |
| DOCKER-005 | Container port vs host port mismatch | — | `NOT_STARTED` |  |
| DOCKER-006 | Dockerfile bad stage/cache creates stale artifact | — | `NOT_STARTED` |  |
| DOCKER-007 | Container runs as root or cannot write due to read-only filesystem | — | `NOT_STARTED` |  |
| DOCKER-008 | Container exits after SIGTERM before active request completes | — | `NOT_STARTED` |  |
| DOCKER-009 | Healthcheck command depends on missing curl/wget in image | — | `NOT_STARTED` |  |
| DOCKER-010 | Disk full from Docker layers/images/log files | — | `NOT_STARTED` |  |
| DOCKER-011 | Restart policy masks repeated crashes | — | `NOT_STARTED` |  |
| DOCKER-012 | Secrets accidentally embedded in image build arguments or logs | — | `NOT_STARTED` |  |
| DOCKER-013 | Container DNS cannot resolve RDS endpoint | — | `NOT_STARTED` |  |
| DOCKER-014 | Deployment pulled old digest even when tag looks current | — | `NOT_STARTED` |  |

## K8SI

Kubernetes workloads · phases P6

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| K8SI-001 | CrashLoopBackOff from invalid command, config or application crash | — | `NOT_STARTED` |  |
| K8SI-002 | ImagePullBackOff/ErrImagePull from registry auth/tag/architecture | — | `NOT_STARTED` |  |
| K8SI-003 | OOMKilled / resource limits set too low | KIND | `VERIFIED_LOCAL` | K8S-003: OOMKilled, exit 137 |
| K8SI-004 | Liveness probe misconfig causes endless restarts | KIND | `PRACTICED` | K8S-001: fault reproduced; recovery output EVIDENCE_MISSING |
| K8SI-005 | Readiness probe blocks traffic, rollout stalls | KIND | `VERIFIED_LOCAL` | K8S-004: rollout held at 3/3 |
| K8SI-006 | Startup probe missing on slow cold start | — | `NOT_STARTED` |  |
| K8SI-007 | Service selector mismatch yields empty EndpointSlice | KIND | `PRACTICED` | K8S-002: fault reproduced; fix output EVIDENCE_MISSING |
| K8SI-008 | Service port/targetPort mismatch and 502/503 | KIND | `SELF_REPORTED` | K8S-007 Incident 02 |
| K8SI-009 | Ingress Host/path mismatch yields 404 or 503 | KIND | `VERIFIED_LOCAL` | K8S-002: Traefik 200/404/503 |
| K8SI-010 | NodePort Cluster vs Local, source IP and uneven reachability | KIND | `PARTIAL_LOCAL` | Cluster verified; Local not |
| K8SI-011 | Cross-node CNI routing/overlay blackhole | — | `NOT_STARTED` |  |
| K8SI-012 | CoreDNS failure or intermittent upstream resolution | — | `NOT_STARTED` |  |
| K8SI-013 | NetworkPolicy denies DNS, DB or cross-namespace traffic | — | `NOT_STARTED` |  |
| K8SI-014 | Rolling update maxSurge/maxUnavailable causes capacity drop | — | `NOT_STARTED` |  |
| K8SI-015 | Rollback to known-good digest and verify after bad release | — | `NOT_STARTED` |  |
| K8SI-016 | Pod termination/preStop/SIGTERM disconnects inflight requests | KIND | `VERIFIED_LOCAL` | K8S-004: graceful drain |
| K8SI-017 | PDB blocks drain or is violated by unplanned failure | — | `NOT_STARTED` |  |
| K8SI-018 | Pod Pending due to taints/tolerations and nodeSelector/affinity | — | `NOT_STARTED` |  |
| K8SI-019 | Pod Pending due to CPU/memory pressure or quota/LimitRange | — | `NOT_STARTED` |  |
| K8SI-020 | HPA cannot scale because metrics-server/CPU requests unavailable | — | `NOT_STARTED` |  |
| K8SI-021 | RBAC denies API call although service account token exists | KIND | `VERIFIED_LOCAL` | K8S-006: RBAC matrix |
| K8SI-022 | ServiceAccount token automount disabled breaks app identity | KIND | `VERIFIED_LOCAL` | K8S-006: automount off |
| K8SI-023 | Pod Security Admission rejects privileged/root/capabilities | — | `NOT_STARTED` |  |
| K8SI-024 | PVC Pending due to StorageClass or binding mode | — | `NOT_STARTED` |  |
| K8SI-025 | StatefulSet PVC persistence versus Pod replacement | KIND | `VERIFIED_LOCAL` | K8S-005: StatefulSet PVC |
| K8SI-026 | RWO disk already attached to another node / AZ conflict | THEORY | `THEORY_LEARNED` | K8S-007 Incident 03 |
| K8SI-027 | EBS PV node affinity conflict in degraded AZ | THEORY | `THEORY_LEARNED` | K8S-007 Incident 03 |
| K8SI-028 | TopologySpreadConstraints fails to distribute replicas | — | `NOT_STARTED` |  |
| K8SI-029 | Secret rotation does not reload environment variables | — | `NOT_STARTED` |  |
| K8SI-030 | API service uses wrong image tag despite successful Helm apply | — | `NOT_STARTED` |  |
| K8SI-031 | Resource requests too high waste cluster capacity and block scheduling | — | `NOT_STARTED` |  |
| K8SI-032 | Certificate/Ingress controller misconfig causes TLS issues | — | `NOT_STARTED` |  |

## EKS

AWS EKS operations · phases P7/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| EKS-001 | Control plane reachable but worker node fails to join cluster | — | `NOT_STARTED` |  |
| EKS-002 | Managed Node Group stuck creating/degraded due to IAM/network | — | `NOT_STARTED` |  |
| EKS-003 | Node in private subnet cannot access ECR/STS/EKS endpoints | — | `NOT_STARTED` |  |
| EKS-004 | AWS VPC CNI IP address exhaustion, Pods Pending/ContainerCreating | — | `NOT_STARTED` |  |
| EKS-005 | AWS VPC CNI daemon failure causes Pod networking outage | — | `NOT_STARTED` |  |
| EKS-006 | IRSA trust condition namespace/SA mismatch returns AccessDenied | — | `NOT_STARTED` |  |
| EKS-007 | EKS Pod Identity association/agent misconfigured | — | `NOT_STARTED` |  |
| EKS-008 | ECR authentication vs node role vs Pod permissions confused | — | `NOT_STARTED` |  |
| EKS-009 | AWS Load Balancer Controller missing IAM permissions or annotations | — | `NOT_STARTED` |  |
| EKS-010 | ALB target type ip vs instance mismatch causing unhealthy targets | — | `NOT_STARTED` |  |
| EKS-011 | ALB security group rules/controller reconciliation break connectivity | — | `NOT_STARTED` |  |
| EKS-012 | EBS CSI driver absent or lacking IAM; PVC not bound | — | `NOT_STARTED` |  |
| EKS-013 | EBS AZ pinning causes scheduling deadlock after node failure | — | `NOT_STARTED` |  |
| EKS-014 | CoreDNS replicas unavailable due to insufficient capacity | — | `NOT_STARTED` |  |
| EKS-015 | Cluster Autoscaler/Karpenter provisioning blocked by IAM/quotas | — | `NOT_STARTED` |  |
| EKS-016 | Karpenter wrong instance family or limits increases costs | — | `NOT_STARTED` |  |
| EKS-017 | HPA scales pods but cluster has no compute capacity | — | `NOT_STARTED` |  |
| EKS-018 | EKS control-plane endpoint public/private access incorrectly configured | — | `NOT_STARTED` |  |
| EKS-019 | EKS cluster version upgrade/add-on incompatibility | — | `NOT_STARTED` |  |
| EKS-020 | Worker AMI or Kubernetes version mismatch after upgrade | — | `NOT_STARTED` |  |
| EKS-021 | Node drain triggers service 5xx due to poor PDB/graceful handling | — | `NOT_STARTED` |  |
| EKS-022 | AWS EKS logging disabled hides API audit/security evidence | — | `NOT_STARTED` |  |
| EKS-023 | OIDC issuer/role propagation issue blocks Pod access to AWS services | — | `NOT_STARTED` |  |
| EKS-024 | Helm values/Argo CD sync drift undoes manual emergency fix | — | `NOT_STARTED` |  |
| EKS-025 | EKS cross-AZ RDS/API performance and NAT costs unexpectedly increase | — | `NOT_STARTED` |  |
| EKS-026 | IAM deny on Kubernetes API access entry or auth mapping | — | `NOT_STARTED` |  |
| EKS-027 | Security group for pods/network policy conflicts with expected path | — | `NOT_STARTED` |  |
| EKS-028 | Multi-environment EKS contexts mistaken: deploy to wrong cluster | — | `NOT_STARTED` |  |

## DB

RDS PostgreSQL, data, recovery · phases P1/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| DB-001 | RDS creation denied due to managed master secret permissions | AWS | `RECOVERED_PASS` | INC-02, 2026-11-12; raw log to backfill |
| DB-002 | EC2 app lacks GetSecretValue/KMS decrypt permissions | — | `NOT_STARTED` |  |
| DB-003 | App uses master user rather than least-privilege runtime account | — | `NOT_STARTED` |  |
| DB-004 | Wrong RDS hostname, port, SG or subnet route causes timeout | — | `NOT_STARTED` |  |
| DB-005 | Wrong username/password or TLS mode produces authentication failure | — | `NOT_STARTED` |  |
| DB-006 | Connection pool exhausted under modest concurrent load | — | `NOT_STARTED` |  |
| DB-007 | Long-running transaction/lock blocks writes and API latency | — | `NOT_STARTED` |  |
| DB-008 | Deadlock/serialization conflict causes intermittent failures | — | `NOT_STARTED` |  |
| DB-009 | Bad migration corrupts schema compatibility; expand-contract rollback | — | `NOT_STARTED` |  |
| DB-010 | RDS storage exhaustion causes writes to fail | — | `NOT_STARTED` |  |
| DB-011 | RDS CPU/memory saturation causes slow endpoints | — | `NOT_STARTED` |  |
| DB-012 | RDS maintenance/reboot connection resets and app recovery | — | `NOT_STARTED` |  |
| DB-013 | Restore from snapshot and verify data correctness | — | `NOT_STARTED` |  |
| DB-014 | Point-in-time recovery RPO/RTO tabletop and bounded exercise | — | `NOT_STARTED` |  |
| DB-015 | RDS Single-AZ instance failure and failover trade-off | — | `NOT_STARTED` |  |
| DB-016 | Multi-AZ failover with app reconnection resilience | — | `NOT_STARTED` |  |
| DB-017 | Backup retention/deletion protection/final snapshot teardown barriers | — | `NOT_STARTED` |  |
| DB-018 | Secrets rotation invalidates connection pool mid-flight | — | `NOT_STARTED` |  |
| DB-019 | Slow query missing index causes high database CPU | — | `NOT_STARTED` |  |
| DB-020 | Data consistency check across API release and DB version | — | `NOT_STARTED` |  |

## IAM

AWS identity, secrets, access · phases P1/P9

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| IAM-001 | Deployment user can read but lacks CreateVpc/CreateRole/RequestCertificate | AWS | `RECOVERED_PASS` | INC-01, 2026-11-12; raw log to backfill |
| IAM-002 | iam:PassRole missing even though CreateRole succeeded | — | `NOT_STARTED` |  |
| IAM-003 | Wrong AWS_PROFILE/Region/account can target unrelated resources | — | `NOT_STARTED` |  |
| IAM-004 | AWS SSO credentials expired; session/token troubleshooting | — | `NOT_STARTED` |  |
| IAM-005 | IAM explicit deny/SCP/permissions boundary overrides allow | — | `NOT_STARTED` |  |
| IAM-006 | Role trust EC2.amazonaws.com wrong or EC2 profile detached | — | `NOT_STARTED` |  |
| IAM-007 | IMDSv2 token required but legacy script assumes IMDSv1 | — | `NOT_STARTED` |  |
| IAM-008 | Secrets leaked into Terraform state, cloud-init, logs or Git | — | `NOT_STARTED` |  |
| IAM-009 | Terraform Cloudflare API token missing/expired/overbroad | — | `NOT_STARTED` |  |
| IAM-010 | S3 bucket policy vs IAM policy conflict returns 403 | — | `NOT_STARTED` |  |
| IAM-011 | AWS KMS key policy denies access despite IAM allow | — | `NOT_STARTED` |  |
| IAM-012 | ECR pull-only vs push-only credentials/permissions mismatch | — | `NOT_STARTED` |  |
| IAM-013 | Security Group exposes metrics/DB/SSH unexpectedly | — | `NOT_STARTED` |  |
| IAM-014 | CloudTrail/audit trail missing for security-sensitive events | — | `NOT_STARTED` |  |
| IAM-015 | RDS secret rotation and credential lifecycle verification | — | `NOT_STARTED` |  |
| IAM-016 | Container image critical CVE in Trivy/ECR scan and remediation | — | `NOT_STARTED` |  |
| IAM-017 | OIDC GitHub trust condition permits unwanted repository/branch | — | `NOT_STARTED` |  |
| IAM-018 | WAF rule ownership, access control and privilege review | — | `NOT_STARTED` |  |
| IAM-019 | deploy operator lacks ssm:StartSession while EC2 managed instance is online | AWS | `RECOVERED_PASS` | [INC-03](INC-03-ssm-startsession-denied.md); screenshots 2026-11-18/19 |
| IAM-020 | SSM StartSession granted but end-user document permissions denied | — | `NOT_STARTED` |  |
| IAM-021 | KMS decrypt denied even though GetSecretValue allowed | — | `NOT_STARTED` |  |
| IAM-022 | service linked role creation blocked by SCP | — | `NOT_STARTED` |  |
| IAM-023 | Cloudflare zone API read works but DNS edit denied | — | `NOT_STARTED` |  |
| IAM-024 | Pod Identity agent lacks required endpoint connectivity | — | `NOT_STARTED` |  |
| IAM-025 | cross-account AssumeRole succeeds in one account only | — | `NOT_STARTED` |  |
| IAM-026 | STS session expires mid CI deploy | — | `NOT_STARTED` |  |

## CICD

Git, pipelines, GitOps, releases · phases P3

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| CICD-001 | CI runner missing AWS OIDC permission or invalid identity token | — | `NOT_STARTED` |  |
| CICD-002 | GitHub Actions job path wrong; no trigger or failed dependency | — | `NOT_STARTED` |  |
| CICD-003 | Pipeline builds wrong architecture for deployment target | — | `NOT_STARTED` |  |
| CICD-004 | Tag immutability blocks retry with same SHA | — | `NOT_STARTED` |  |
| CICD-005 | Pipeline reports success but release never reached runtime | — | `NOT_STARTED` |  |
| CICD-006 | Deploy rolling update breaks readiness; safe rollback | — | `NOT_STARTED` |  |
| CICD-007 | CI deploy user overprivileged; separate build and deploy roles | — | `NOT_STARTED` |  |
| CICD-008 | Terraform plan/apply drift from out-of-band AWS change | — | `NOT_STARTED` |  |
| CICD-009 | Terraform state locking, concurrent deploy or backend corruption | — | `NOT_STARTED` |  |
| CICD-010 | Argo CD OutOfSync caused by manual kubectl hotfix | — | `NOT_STARTED` |  |
| CICD-011 | Helm chart values omit secret/service account/ingress fields | — | `NOT_STARTED` |  |
| CICD-012 | Security scan gate fails and pipeline policy exception requested | — | `NOT_STARTED` |  |
| CICD-013 | Artifact digest/version provenance uncertain across environments | — | `NOT_STARTED` |  |
| CICD-014 | Broken DB migration requires coordinated app rollback | — | `NOT_STARTED` |  |
| CICD-015 | EKS blue/green or canary rollout falsely healthy | — | `NOT_STARTED` |  |
| CICD-016 | Repository secret rotation invalidates pipeline deploy | — | `NOT_STARTED` |  |

## OBS

Observability, on-call · phases P2/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| OBS-001 | CloudWatch Agent installed but no logs shipped | — | `NOT_STARTED` |  |
| OBS-002 | Prometheus /metrics scraped from wrong address/port | — | `NOT_STARTED` |  |
| OBS-003 | Metrics endpoint reachable externally, sensitive leakage | — | `NOT_STARTED` |  |
| OBS-004 | Grafana dashboard empty due to wrong data source/query/labels | — | `NOT_STARTED` |  |
| OBS-005 | High-cardinality request labels explode metrics costs | — | `NOT_STARTED` |  |
| OBS-006 | Latency p95 spikes while averages look normal | — | `NOT_STARTED` |  |
| OBS-007 | HTTP 5xx source ambiguity Cloudflare vs ALB vs API vs DB | — | `NOT_STARTED` |  |
| OBS-008 | Tracing lost between ALB headers and app request ID | — | `NOT_STARTED` |  |
| OBS-009 | Alert threshold too low leads to false positives and fatigue | — | `NOT_STARTED` |  |
| OBS-010 | Alert threshold too high misses real outage | — | `NOT_STARTED` |  |
| OBS-011 | CloudWatch log ingestion spikes bills | — | `NOT_STARTED` |  |
| OBS-012 | Dashboards have no baselines/annotations for deployment changes | — | `NOT_STARTED` |  |
| OBS-013 | SLO error budget burn and mitigation decisions | — | `NOT_STARTED` |  |
| OBS-014 | Synthetic probes fail while customer-facing endpoint works | — | `NOT_STARTED` |  |
| OBS-015 | Synthetic probes succeed while authenticated user journey fails | — | `NOT_STARTED` |  |
| OBS-016 | SLI excludes failed edge requests and understates real error rate | — | `NOT_STARTED` |  |
| OBS-017 | Logs show no errors because app hangs before structured logging | — | `NOT_STARTED` |  |
| OBS-018 | Postmortem lacking timeline/cause/corrective action | — | `NOT_STARTED` |  |

## REL

Reliability, scaling, FinOps · phases P8/P10

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| REL-001 | EC2 or container failure and recovery with no data loss | — | `NOT_STARTED` |  |
| REL-002 | ALB unhealthy target and fail-open behavior under total target outage | — | `NOT_STARTED` |  |
| REL-003 | Autoscaling storms due to noisy CPU or slow startup | — | `NOT_STARTED` |  |
| REL-004 | Rolling deployment with one replica causes downtime | — | `NOT_STARTED` |  |
| REL-005 | Single-AZ outage impacts EC2 and RDS; design recovery | — | `NOT_STARTED` |  |
| REL-006 | Multi-AZ RDS failover vs app retry/timeout behavior | — | `NOT_STARTED` |  |
| REL-007 | Load test with bounded traffic identifies concurrency bottleneck | — | `NOT_STARTED` |  |
| REL-008 | Cache avoids repeat DB queries but causes stale reads | — | `NOT_STARTED` |  |
| REL-009 | SQS worker retry duplicates messages; design idempotency | — | `NOT_STARTED` |  |
| REL-010 | Async job backlog and backpressure in peak traffic | — | `NOT_STARTED` |  |
| REL-011 | EC2 public IPv4/ALB/NAT/data transfer charges exceed budget | — | `NOT_STARTED` |  |
| REL-012 | Prometheus/CloudWatch storage retention and cardinality costs | — | `NOT_STARTED` |  |
| REL-013 | EKS control plane + node group costs exceed EC2 baseline | — | `NOT_STARTED` |  |
| REL-014 | Stale EC2/RDS volumes, snapshots, EIPs create orphan charges | — | `NOT_STARTED` |  |
| REL-015 | RDS snapshot restore and integrity verification under RPO/RTO | — | `NOT_STARTED` |  |
| REL-016 | Capacity planning for spikes and budget-aware headroom | — | `NOT_STARTED` |  |
| REL-017 | Chaos injection rollback fails and threatens lab safety | — | `NOT_STARTED` |  |
| REL-018 | Safe Terraform destroy blocked by RDS deletion protection | — | `NOT_STARTED` |  |
| REL-019 | Document backup before teardown and verify cleanup | — | `NOT_STARTED` |  |
| REL-020 | Incident response tabletop with roles, comms, severity/escalation | — | `NOT_STARTED` |  |

## SYS

Linux systems · phases P1/P5

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| SYS-001 | systemd service enabled but not started on EC2 reboot | — | `NOT_STARTED` |  |
| SYS-002 | journald rotation removes critical logs | — | `NOT_STARTED` |  |
| SYS-003 | EC2 time drift breaks TLS and STS tokens | — | `NOT_STARTED` |  |
| SYS-004 | wrong hostname or resolv.conf breaks DNS intermittently | — | `NOT_STARTED` |  |
| SYS-005 | file descriptors exhausted and accept() fails | — | `NOT_STARTED` |  |
| SYS-006 | process dies on OOM outside container resource limits | — | `NOT_STARTED` |  |
| SYS-007 | inodes exhausted despite disk free bytes | — | `NOT_STARTED` |  |
| SYS-008 | EBS filesystem not mounted after instance restart | — | `NOT_STARTED` |  |
| SYS-009 | filesystem read-only due to IO errors | — | `NOT_STARTED` |  |
| SYS-010 | mount permissions ownership break runtime uploads | — | `NOT_STARTED` |  |
| SYS-011 | CPU steal or burst credits produce request latency | — | `NOT_STARTED` |  |
| SYS-012 | kernel socket backlog full under ordinary traffic | — | `NOT_STARTED` |  |
| SYS-013 | firewall/iptables/nftables rule hides an application port | — | `NOT_STARTED` |  |
| SYS-014 | SELinux or AppArmor denies writes despite Unix permissions | — | `NOT_STARTED` |  |
| SYS-015 | patch reboot interrupts requests without drain | — | `NOT_STARTED` |  |
| SYS-016 | SSM agent stops or cannot register after OS update | — | `NOT_STARTED` |  |
| SYS-017 | startup order service runs before network is ready | — | `NOT_STARTED` |  |
| SYS-018 | log rotation or Docker logs fill root disk | — | `NOT_STARTED` |  |

## TF

Terraform and IaC operations · phases P5

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| TF-001 | provider version upgrade creates unplanned changes | — | `NOT_STARTED` |  |
| TF-002 | lost local state after successful AWS apply | — | `NOT_STARTED` |  |
| TF-003 | remote state S3 backend lock contention | — | `NOT_STARTED` |  |
| TF-004 | wrong backend key causes deployment to wrong environment | — | `NOT_STARTED` |  |
| TF-005 | invalid moved block triggers resource recreation | — | `NOT_STARTED` |  |
| TF-006 | manual AWS edit creates drift hidden until refresh | — | `NOT_STARTED` |  |
| TF-007 | import existing resource with wrong logical address | — | `NOT_STARTED` |  |
| TF-008 | Terraform graph circular dependency between IAM and compute | — | `NOT_STARTED` |  |
| TF-009 | plan created under different variable set applied later | — | `NOT_STARTED` |  |
| TF-010 | state contains secrets leaked through CI artifact | — | `NOT_STARTED` |  |
| TF-011 | provider credentials point to wrong AWS account | — | `NOT_STARTED` |  |
| TF-012 | state encryption or bucket permission denies access | — | `NOT_STARTED` |  |
| TF-013 | policy-as-code denies Internet-exposed RDS in pull request | — | `NOT_STARTED` |  |
| TF-014 | module default tags omitted on one resource | — | `NOT_STARTED` |  |
| TF-015 | race between ACM validation and HTTPS listener | — | `NOT_STARTED` |  |
| TF-016 | unsafe destroy bypasses database deletion protection assumptions | — | `NOT_STARTED` |  |
| TF-017 | stale resource in state after manual deletion | — | `NOT_STARTED` |  |
| TF-018 | conditional count/for_each key refactor causes replacement | — | `NOT_STARTED` |  |

## FIN

FinOps · phases P2/P10

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| FIN-001 | idle ALB billed after API deleted | — | `NOT_STARTED` |  |
| FIN-002 | EC2 stopped but EBS volume still charged | — | `NOT_STARTED` |  |
| FIN-003 | RDS deletion leaves billable manual snapshot | — | `NOT_STARTED` |  |
| FIN-004 | EKS cluster fee persists after node group teardown | — | `NOT_STARTED` |  |
| FIN-005 | NAT Gateway charged during low/no application traffic | — | `NOT_STARTED` |  |
| FIN-006 | cross-AZ RDS traffic raises transfer cost | — | `NOT_STARTED` |  |
| FIN-007 | CloudWatch logs retention unlimited increases spending | — | `NOT_STARTED` |  |
| FIN-008 | Prometheus high cardinality inflates metric charges | — | `NOT_STARTED` |  |
| FIN-009 | Cloudflare premium rule unexpectedly increases plan cost | — | `NOT_STARTED` |  |
| FIN-010 | orphan EIP or public IPv4 billed while idle | — | `NOT_STARTED` |  |
| FIN-011 | orphan ECR image storage and replication charges | — | `NOT_STARTED` |  |
| FIN-012 | S3 versioned noncurrent objects forgotten in estimates | — | `NOT_STARTED` |  |
| FIN-013 | unexpected data egress due to CDN misconfiguration | — | `NOT_STARTED` |  |
| FIN-014 | ALB LCU usage growth from excessive connections | — | `NOT_STARTED` |  |
| FIN-015 | unbounded autoscaler creates runaway node spend | — | `NOT_STARTED` |  |
| FIN-016 | rightsizing CPU from average misses p95 saturation | — | `NOT_STARTED` |  |
| FIN-017 | Spot instance interruption raises recovery cost | — | `NOT_STARTED` |  |
| FIN-018 | Savings Plan commitment not justified by short lab | — | `NOT_STARTED` |  |
| FIN-019 | budget alarm not delivered because email unverified | — | `NOT_STARTED` |  |
| FIN-020 | Cost Explorer delayed data mistaken for real-time spend | — | `NOT_STARTED` |  |
| FIN-021 | DB Multi-AZ upgrade cost impact unbudgeted | — | `NOT_STARTED` |  |
| FIN-022 | resource tags inconsistent and chargeback untraceable | — | `NOT_STARTED` |  |

## SEC

Security and DevSecOps · phases P4/P9

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| SEC-001 | secret accidentally committed to Git and rotated/revoked | — | `NOT_STARTED` |  |
| SEC-002 | Cloudflare API token accidentally logged during CI | — | `NOT_STARTED` |  |
| SEC-003 | SSM session permitted to unapproved principal | — | `NOT_STARTED` |  |
| SEC-004 | EC2 role wildcard credentials allow excessive permissions | — | `NOT_STARTED` |  |
| SEC-005 | GitHub OIDC sub claim permits arbitrary branch | — | `NOT_STARTED` |  |
| SEC-006 | IAM permissions boundary blocks assumed role | — | `NOT_STARTED` |  |
| SEC-007 | KMS key policy differs from IAM allow grants | — | `NOT_STARTED` |  |
| SEC-008 | public S3 bucket exposes sensitive test records | — | `NOT_STARTED` |  |
| SEC-009 | IAM role escalation through unrestricted PassRole | — | `NOT_STARTED` |  |
| SEC-010 | container image runs privileged with host mounts | — | `NOT_STARTED` |  |
| SEC-011 | security scan critical CVE lacks documented remediation | — | `NOT_STARTED` |  |
| SEC-012 | SBOM artifact does not match running image digest | — | `NOT_STARTED` |  |
| SEC-013 | unsigned image accepted by deployment policy | — | `NOT_STARTED` |  |
| SEC-014 | TLS cert expiry or renewal notification missed | — | `NOT_STARTED` |  |
| SEC-015 | service-to-service encryption disabled after migration | — | `NOT_STARTED` |  |
| SEC-016 | API authentication bypass under proxy/path rewrite | — | `NOT_STARTED` |  |
| SEC-017 | WAF blocks legitimate requests after ruleset update | — | `NOT_STARTED` |  |
| SEC-018 | CloudTrail missing incident audit events | — | `NOT_STARTED` |  |
| SEC-019 | sensitive PII included in logs/dashboard screenshot | — | `NOT_STARTED` |  |
| SEC-020 | Kubernetes namespace admin can read cross-namespace secrets | — | `NOT_STARTED` |  |
| SEC-021 | RBAC ClusterRoleBinding exceeds intended scope | — | `NOT_STARTED` |  |
| SEC-022 | supply chain dependency compromised, need verified patch | — | `NOT_STARTED` |  |

## SUPPLY

Software supply chain · phases P3/P9

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| SUPPLY-001 | dependency lockfile drift produces different image | — | `NOT_STARTED` |  |
| SUPPLY-002 | CI used mutable base image without digest pinning | — | `NOT_STARTED` |  |
| SUPPLY-003 | build cache embeds an old vulnerable layer | — | `NOT_STARTED` |  |
| SUPPLY-004 | untrusted PR can access repository deployment secret | — | `NOT_STARTED` |  |
| SUPPLY-005 | artifact provenance has no source commit linkage | — | `NOT_STARTED` |  |
| SUPPLY-006 | SBOM missing transitive dependencies | — | `NOT_STARTED` |  |
| SUPPLY-007 | image signature missing or verifier misconfigured | — | `NOT_STARTED` |  |
| SUPPLY-008 | vulnerability scan false positive blocks patch rollout | — | `NOT_STARTED` |  |
| SUPPLY-009 | scanner database stale before release | — | `NOT_STARTED` |  |
| SUPPLY-010 | malicious or unknown GitHub Action version introduced | — | `NOT_STARTED` |  |
| SUPPLY-011 | multi-arch manifest lists unsupported architecture | — | `NOT_STARTED` |  |
| SUPPLY-012 | image mirror returns a different digest | — | `NOT_STARTED` |  |
| SUPPLY-013 | ECR lifecycle deletes digest needed for rollback | — | `NOT_STARTED` |  |
| SUPPLY-014 | package registry outage blocks deployments without cache | — | `NOT_STARTED` |  |
| SUPPLY-015 | build job network egress exfiltration concern | — | `NOT_STARTED` |  |

## PERF

Performance · phases P2/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| PERF-001 | p99 latency high while mean and p50 normal | — | `NOT_STARTED` |  |
| PERF-002 | RDS pool queueing causes application timeout | — | `NOT_STARTED` |  |
| PERF-003 | connection limit unexpectedly reached during scale up | — | `NOT_STARTED` |  |
| PERF-004 | GC pause creates intermittent Node.js HTTP stalls | — | `NOT_STARTED` |  |
| PERF-005 | oversized JSON payload exhausts memory | — | `NOT_STARTED` |  |
| PERF-006 | unbounded retry storm amplifies upstream failures | — | `NOT_STARTED` |  |
| PERF-007 | ALB idle timeout disagrees with long-running request | — | `NOT_STARTED` |  |
| PERF-008 | client HTTP keepalive mismatch causes connection reset | — | `NOT_STARTED` |  |
| PERF-009 | slow query index choice regresses after migration | — | `NOT_STARTED` |  |
| PERF-010 | missing indexes turn synthetic orders search into full scan | — | `NOT_STARTED` |  |
| PERF-011 | CPU burstable instance credits depleted | — | `NOT_STARTED` |  |
| PERF-012 | cross-AZ network round trip affects DB p95 | — | `NOT_STARTED` |  |
| PERF-013 | cache hit ratio low but cache memory high | — | `NOT_STARTED` |  |
| PERF-014 | cold start spikes rollout traffic when replicas scale | — | `NOT_STARTED` |  |
| PERF-015 | load generator itself saturates and biases results | — | `NOT_STARTED` |  |
| PERF-016 | queue processing throughput below incoming rate | — | `NOT_STARTED` |  |
| PERF-017 | rate limiting misconfigured under legitimate concurrency | — | `NOT_STARTED` |  |
| PERF-018 | insufficient dashboard sampling hides rare spikes | — | `NOT_STARTED` |  |

## PLAT

Platform engineering · phases P11

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| PLAT-001 | platform template creates EKS service without default alerts | — | `NOT_STARTED` |  |
| PLAT-002 | new service missing IAM boundary despite passing build | — | `NOT_STARTED` |  |
| PLAT-003 | self-service project has no cost owner tag | — | `NOT_STARTED` |  |
| PLAT-004 | service catalog metadata differs from deployed workload | — | `NOT_STARTED` |  |
| PLAT-005 | platform API deployment blocked by expired identity token | — | `NOT_STARTED` |  |
| PLAT-006 | multi-account role assumption trust too broad | — | `NOT_STARTED` |  |
| PLAT-007 | cross-account ECR pull fails under new workload account | — | `NOT_STARTED` |  |
| PLAT-008 | cluster quota exhausted by another team namespace | — | `NOT_STARTED` |  |
| PLAT-009 | blueprint upgrade breaks older workloads | — | `NOT_STARTED` |  |
| PLAT-010 | platform GitOps application missing correct destination | — | `NOT_STARTED` |  |
| PLAT-011 | policy exception undocumented and never expires | — | `NOT_STARTED` |  |
| PLAT-012 | onboarding process stores secrets in template repo | — | `NOT_STARTED` |  |
| PLAT-013 | internal developer portal catalog permission leak | — | `NOT_STARTED` |  |
| PLAT-014 | platform outage breaks delivery but running services healthy | — | `NOT_STARTED` |  |
| PLAT-015 | new tenant cannot separate logs and cost ownership | — | `NOT_STARTED` |  |

## DR

Disaster recovery · phases P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| DR-001 | RDS final snapshot exists but restoration never verified | — | `NOT_STARTED` |  |
| DR-002 | point-in-time restore misses chosen transaction cutoff | — | `NOT_STARTED` |  |
| DR-003 | backup RPO objective contradicted by observed recovery | — | `NOT_STARTED` |  |
| DR-004 | restored database has wrong DB user grants | — | `NOT_STARTED` |  |
| DR-005 | restored database endpoint change not propagated to app | — | `NOT_STARTED` |  |
| DR-006 | single-AZ EC2 terminates unexpectedly and needs rebuild | — | `NOT_STARTED` |  |
| DR-007 | AZ failure prevents EBS rescheduling | — | `NOT_STARTED` |  |
| DR-008 | standby database promotion exceeds allowed RTO | — | `NOT_STARTED` |  |
| DR-009 | multi-AZ RDS failover leaves stale connections | — | `NOT_STARTED` |  |
| DR-010 | Region-level DNS failover points to absent backup | — | `NOT_STARTED` |  |
| DR-011 | inconsistent app and DB snapshot causes corruption | — | `NOT_STARTED` |  |
| DR-012 | secrets rotation after recovery breaks database client | — | `NOT_STARTED` |  |
| DR-013 | retained EBS snapshot generates unexpected monthly charge | — | `NOT_STARTED` |  |
| DR-014 | restore rehearsal accidentally touches production data | — | `NOT_STARTED` |  |
| DR-015 | failure injection cannot be rolled back within scope | — | `NOT_STARTED` |  |

## APP

Application operations · phases P1/P5

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| APP-001 | /healthz returns 200 while all user requests fail | — | `NOT_STARTED` |  |
| APP-002 | /readyz always 200 despite missing RDS connectivity | — | `NOT_STARTED` |  |
| APP-003 | wrong HTTP status code misleads ALB monitoring | — | `NOT_STARTED` |  |
| APP-004 | API binds only loopback and ALB cannot connect | — | `NOT_STARTED` |  |
| APP-005 | malformed environment variable causes silent fallback | — | `NOT_STARTED` |  |
| APP-006 | migration runs twice concurrently and conflicts | — | `NOT_STARTED` |  |
| APP-007 | idempotency key missing duplicates an order on retry | — | `NOT_STARTED` |  |
| APP-008 | API race condition overwrites order state | — | `NOT_STARTED` |  |
| APP-009 | invalid input returns 500 instead of 400 | — | `NOT_STARTED` |  |
| APP-010 | request ID not propagated through reverse proxy | — | `NOT_STARTED` |  |
| APP-011 | sensitive error stack trace returned to clients | — | `NOT_STARTED` |  |
| APP-012 | clock/timezone mismatch changes order timestamps | — | `NOT_STARTED` |  |
| APP-013 | per-request database client leak exhausts pool | — | `NOT_STARTED` |  |
| APP-014 | background job failure not surfaced in readiness | — | `NOT_STARTED` |  |
| APP-015 | API version incompatible with older client release | — | `NOT_STARTED` |  |
| APP-016 | unbounded body size causes memory spikes | — | `NOT_STARTED` |  |
| APP-017 | HTTP 429 lacks appropriate retry guidance | — | `NOT_STARTED` |  |
| APP-018 | SIGTERM shutdown exits before pending writes finish | — | `NOT_STARTED` |  |
| APP-019 | frontend caching displays stale order after update | — | `NOT_STARTED` |  |
| APP-020 | synthetic smoke test passes but full CRUD path fails | — | `NOT_STARTED` |  |

## DATA

Data integrity · phases P1/P8

| ID | Scenario | Env | Status | Evidence |
| --- | --- | --- | --- | --- |
| DATA-001 | schema migration drops column before old app retires | — | `NOT_STARTED` |  |
| DATA-002 | runtime DB user given CREATE ROLE / superuser privileges | — | `NOT_STARTED` |  |
| DATA-003 | backup encryption key inaccessible during restoration | — | `NOT_STARTED` |  |
| DATA-004 | collation/locale mismatch changes ordering results | — | `NOT_STARTED` |  |
| DATA-005 | Unicode/vietnamese data insertion and retrieval fails | — | `NOT_STARTED` |  |
| DATA-006 | connection pooling proxy changes transaction semantics | — | `NOT_STARTED` |  |
| DATA-007 | RDS log retention omits slow query diagnosis | — | `NOT_STARTED` |  |
| DATA-008 | transaction isolation insufficient for inventory updates | — | `NOT_STARTED` |  |
| DATA-009 | read replica lag causes read-after-write inconsistency | — | `NOT_STARTED` |  |
| DATA-010 | DB parameter change requires reboot and downtime | — | `NOT_STARTED` |  |
| DATA-011 | vacuum/bloat increases disk despite low row count | — | `NOT_STARTED` |  |
| DATA-012 | DB certificate root rotation breaks TLS clients | — | `NOT_STARTED` |  |
