# Ruby audit module

## Establish runtime and frameworks

Read `Gemfile`/lock, engine/workspace structure, route definitions, controllers/endpoints, middleware, jobs, serializers, templates, storage, and environment/deployment config. Separate Rails web processes, workers, Rake tasks, and standalone services.

## High-value review paths

- Trace params, headers, cookies, uploaded files, job arguments, webhook data, database content, and CLI values into SQL, templates, commands, paths, redirects, outbound HTTP, YAML/Marshal, metaprogramming, and dynamic constant/class loading.
- Inspect SQL interpolation, `find_by_sql`, raw/order/group/select fragments, Arel SQL literals, and search DSLs. Active Record hash/placeholder conditions normally bind values.
- Ordinary ERB/Rails output is escaped. Focus on `html_safe`, `raw`, unsafe `sanitize` configuration, `content_tag`/helper composition, JavaScript contexts, and stored rich text.
- Review `system`, backticks, `%x`, `Open3`, shell strings, executable/option control, environment, and working directory.
- Check open redirects, URL parsing, redirect-following HTTP clients, DNS/IP policy, and cloud metadata for SSRF.
- Audit `YAML.load`, `Marshal.load`, signed/encrypted cookie use, GlobalID/job deserialization, and object types allowed by custom coders.

## Rails checks

- Enumerate routes and `before_action` inheritance/skips. Verify policies/authorization for the exact resource, tenant, nested resource, and bulk operation.
- Strong Parameters limit assignment fields; they do not prove the caller may change those fields. Check nested attributes and role/status/tenant ownership.
- Review CSRF skips for cookie-authenticated actions, SameSite assumptions, Action Cable origin/auth, host authorization, proxy trust, and session/cookie scope.
- Check Active Storage content type/disposition, variant processors, public blobs, direct uploads, signed identifier scope, and filename handling.
- Review encrypted credentials and `secret_key_base`, password reset/confirmation/invite tokens, impersonation, admin engines, preview/draft endpoints, and cache keys.
- Inspect job retries and transaction/job ordering for duplicate or premature privileged actions.

## Avoid false positives

- Active Record bound conditions and ordinary template interpolation are normally safe.
- Symbol creation on modern supported Ruby is not automatically permanent-memory DoS; confirm version and practical impact.
- `send`/metaprogramming is not a vulnerability unless an attacker controls a dangerous method/constant choice and arguments.
- A route lacking a controller check may still be protected by a policy, middleware, or service object; trace the full call path.

## Dependency validation

Run `bundle audit` when available. Confirm the locked version, deployed group/platform, vulnerable feature, and reachability.

## Upstream references

- [Rails Security Guide source](https://github.com/rails/rails/blob/main/guides/source/security.md)
- [Ruby Advisory Database](https://github.com/rubysec/ruby-advisory-db)
- [Brakeman Rails scanner](https://github.com/presidentbeef/brakeman)
