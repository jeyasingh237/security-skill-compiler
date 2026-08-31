# PHP audit module

## Establish runtime and frameworks

Read `composer.json`/lock, front controllers, route registration, middleware, service providers/bundles, ORM configuration, queue workers, console commands, template configuration, and web-server/deployment files. Check the actual supported PHP version and enabled extensions.

## High-value review paths

- Trace superglobals, framework request objects, headers, cookies, uploaded file names/content, queue/webhook payloads, database content, and CLI arguments into SQL, templates, shell/process APIs, file paths/includes, outbound HTTP, and deserialization.
- Treat dynamic `include`/`require`, `eval`, unsafe template compilation, `unserialize` of untrusted input, shell strings, and attacker-controlled callbacks/reflection as high-signal sinks.
- Inspect PDO/emulated prepare behavior, raw ORM expressions, dynamic identifiers, order clauses, search DSLs, and string-built SQL. Bound values do not protect query structure.
- Review `escapeshellarg` in the context of the chosen shell and target executable; option injection can remain when an argument begins with `-`.
- Check stream wrappers and URL schemes, redirects in HTTP clients, DNS/IP validation, proxy settings, and cloud metadata for SSRF.
- Audit uploads, MIME/content validation, public storage, executable extensions, path canonicalization, symlinks, archive extraction, and temporary files.

## Laravel checks

- Blade escapes `{{ }}` by default. Focus on `{!! !!}`, raw HTML helpers, unsafe Markdown, and JavaScript/URL contexts.
- Eloquent/query builder binds ordinary values. Inspect `DB::raw`, `whereRaw`, `orderByRaw`, `selectRaw`, dynamic columns, and unsafe scopes.
- Validate route middleware plus policies/gates for the exact object and tenant. Form-request validation is not authorization unless its `authorize` logic enforces the needed boundary.
- Review mass assignment (`fillable`/`guarded`), hidden/visible serialization fields, API resources, signed URL scope/expiry, password reset, impersonation, and queued jobs.
- Check CSRF exclusions only for ambient-cookie endpoints; inspect Sanctum/session domains and CORS together.

## Symfony checks

- Derive effective firewall and `access_control` ordering, authenticators, voters, route attributes, remember-me, login links, and proxy trust.
- Review Twig raw output, serializer groups, entity mapping, expression language use, and debug/profiler exposure.

## Avoid false positives

- Blade/Twig ordinary interpolation and ORM bound predicates are generally safe in their documented contexts.
- `filter_var` behavior depends on the chosen filter; validate security semantics rather than treating its presence as universal sanitization.
- A committed `.env.example` placeholder is not a secret. Redact and verify actual credential validity before reporting any secret.

## Dependency validation

Run `composer audit` when available. Confirm the installed package/version, deployment path, vulnerable feature, and runtime reachability.

## Upstream references

- [PHP manual source, security section](https://github.com/php/doc-en/tree/master/security)
- [Laravel documentation](https://github.com/laravel/docs)
- [Symfony Security component](https://github.com/symfony/security-core)
- [FriendsOfPHP security advisories](https://github.com/FriendsOfPHP/security-advisories)
