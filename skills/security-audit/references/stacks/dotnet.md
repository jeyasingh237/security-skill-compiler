# .NET audit module

## Establish runtime and frameworks

Read solution/project files, package locks, target frameworks, `Program.cs`/startup code, endpoint/controller registration, middleware order, authentication schemes, authorization policies, model binding, data protection, and deployment settings. Separate ASP.NET Core, workers, desktop services, and legacy .NET Framework components.

## High-value review paths

- Trace route/query/body/header/cookie/form values, uploaded files, messages, claims, and persisted user content into SQL, Razor/HTML, process execution, paths, outbound HTTP, reflection, and serializers.
- Inspect `FromSqlRaw`, `ExecuteSqlRaw`, interpolated SQL usage, dynamic identifiers/order clauses, Dapper raw strings, and provider-specific APIs. EF/LINQ predicates generally parameterize values.
- Razor encodes ordinary output. Focus on `Html.Raw`, custom `IHtmlContent`, JavaScript/URL contexts, unsafe markdown, and stored content rendered by another layer.
- Review `ProcessStartInfo`, `UseShellExecute`, command-line quoting, executable selection, user-controlled flags, and PowerShell/shell invocation.
- Check path canonicalization, `Path.GetFullPath`, prefix boundary mistakes, symlinks, archive extraction, uploads, and temporary-file races.
- Inspect JSON polymorphism/type metadata, legacy binary serializers, XML readers, reflection/dynamic assembly loading, and unsafe native interop.

## ASP.NET Core checks

- Derive effective middleware order. Authentication must populate identity before authorization; endpoint routing and fallback policies must cover every mapped endpoint.
- Enumerate `[AllowAnonymous]`, fallback/default policies, named schemes, policy schemes, minimal APIs, hubs, gRPC, health checks, static files, and management endpoints.
- Validate object- and tenant-level authorization inside state-changing operations. Claims existence is not proof that a claim applies to the target resource.
- Check cookie flags and domains, antiforgery coverage for credentialed browser requests, CORS with credentials, forwarded-header trusted networks/proxies, host filtering, and redirect targets.
- Verify JWT signature, algorithm, key, issuer, audience, time, and token type. Avoid custom token minting when framework/provider flows exist.
- Review model binding and DTO-to-entity mapping for over-posting. Validation attributes do not provide authorization.
- Check Data Protection key persistence, encryption at rest, application isolation, and rotation in multi-instance deployments before claiming session or CSRF integrity problems.

## Avoid false positives

- `FromSqlInterpolated`/parameterized APIs are designed to bind values; raw identifiers and fragments still require validation.
- Razor interpolation is encoded by default; prove entry into a raw or different output context.
- Missing antiforgery is not relevant to bearer-token APIs that do not use ambient browser credentials.
- Development settings are not production findings without evidence the production profile uses them.

## Dependency validation

Run `dotnet list package --vulnerable --include-transitive` when available. Confirm target framework, resolved asset, deployed component, vulnerable API, and runtime reachability.

## Upstream references

- [ASP.NET Core security documentation source](https://github.com/dotnet/AspNetCore.Docs/tree/main/aspnetcore/security)
- [ASP.NET Core source](https://github.com/dotnet/aspnetcore)
- [Security Code Scan analyzers](https://github.com/security-code-scan/security-code-scan)
