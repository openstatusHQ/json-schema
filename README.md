# OpenStatus Synthetic Monitoring Schema

Use this schema to define synthetic monitoring checks in OpenStatus.

```yaml
# yaml-language-server: $schema=https://www.openstatus.dev/schema.json

monitor1:
  name: "Test"
  description: "This is a test"
  frequency: "1m"
  active: true
  regions: ["iad"]
  retry: 3
  kind: http
  request:
    url: https://openstat.us
    method: GET
    headers:
      User-Agent: OpenStatus
  assertions:
    - kind: statusCode
      compare: eq
      target: 200
```