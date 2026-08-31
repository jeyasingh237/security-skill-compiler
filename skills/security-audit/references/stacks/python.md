# Python audit module

## Establish runtime and frameworks

Read `pyproject.toml`, lock/requirements files, settings modules, URL/route registration, ASGI/WSGI entry points, task workers, and deployment configuration. Separate web requests, management commands, notebooks, build hooks, and background queues.

## High-value review paths

- Trace request values, headers, cookies, file names/content, queue messages, CLI arguments, database content from other users, and webhook payloads into SQL, templates, subprocesses, paths, outbound HTTP, deserializers, and dynamic imports.
- Treat `pickle`, `marshal`, unsafe YAML constructors, `eval`, `exec`, dynamic imports, template compilation from user input, and `subprocess` with `shell=True` as high-signal sinks when data is untrusted.
- Check `tempfile`, archive extraction, `pathlib`/`os.path` resolution, symlinks, and upload storage for containment and race conditions.
- For SSRF, inspect redirects, DNS resolution, proxy configuration, cloud metadata access, and alternate URL schemes. A configured base URL is operator-controlled; attacker-controlled suffixes may still escape through URL resolution.
- Review async cancellation, task retries, transaction boundaries, and duplicate message delivery for state inconsistencies.

## Framework-specific checks

### Django

- Django templates auto-escape ordinary variables and ORM filters parameterize values. Focus on `safe`, `mark_safe`, autoescape disablement, raw SQL, dynamic identifiers, `extra`, and unsafe custom template tags.
- Enumerate URL patterns and decorators/middleware. Check object- and tenant-level authorization beyond login checks.
- Review `csrf_exempt`, CORS, host validation, redirect targets, file serving, signed values, password-reset flows, admin actions, and serializer/model field exposure.
- Treat settings as operator-controlled unless repository evidence shows they are derived from a request. Confirm production overrides before reporting `DEBUG` or cookie/header configuration.

### Flask

- Jinja templates escape normal interpolation. Focus on `Markup`, `|safe`, `render_template_string`, user-selected templates, and direct response construction.
- Check secret-key handling, session contents, CSRF extension coverage, blueprint registration, endpoint decorators, debug exposure, and `ProxyFix` trust counts.

### FastAPI and Starlette

- Enumerate dependencies on every route and router. A Pydantic model validates shape; it does not provide caller or resource authorization.
- Check response-model omissions, mass assignment, file/stream limits, background tasks, WebSockets, exception handlers, and OpenAPI/docs exposure.

## Avoid false positives

- ORM predicates and parameterized cursor calls are normally safe from SQL injection; raw strings, identifiers, clauses, and adapter-specific escape hatches need tracing.
- `subprocess.run([program, arg])` does not invoke a shell by default. Options can still be abused if the called program interprets attacker strings as flags or files.
- `hashlib.md5` can be acceptable for non-security checksums. Report it only when collision or preimage resistance is a security requirement.
- `yaml.safe_load` does not construct arbitrary Python objects, though application-level schema validation can still be required.

## Dependency validation

Use `pip-audit` or the project's existing scanner when available. Confirm environment markers, extras, vendoring, the installed version, and code-path reachability before reporting an advisory.

## Upstream references

- [Django security documentation source](https://github.com/django/django/blob/main/docs/topics/security.txt)
- [Flask web security documentation source](https://github.com/pallets/flask/blob/main/docs/web-security.rst)
- [CPython security considerations](https://github.com/python/cpython/blob/main/Doc/library/security_warnings.rst)
- [PyPA pip-audit](https://github.com/pypa/pip-audit)
