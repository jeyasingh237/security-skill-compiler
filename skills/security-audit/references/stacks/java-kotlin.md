# Java and Kotlin audit module

## Establish runtime and frameworks

Read Maven/Gradle settings and lock/catalog files, application entry points, controller/route registration, servlet filters, reactive filters, method security, persistence mappings, serialization configuration, and deployment profiles. Account for generated code and annotation-driven behavior.

## High-value review paths

- Trace request/RPC values, headers, uploaded files, messages, database content, expression input, and serialized objects into queries, templates, process execution, paths, outbound requests, reflection, class loading, and deserialization.
- Inspect JPA/JPQL/native queries, criteria raw fragments, dynamic sort/property names, JDBC concatenation, and search/query DSLs. ORM APIs protect bound values, not necessarily identifiers or raw expressions.
- Review Jackson default typing/polymorphic deserialization, Java serialization, XML parser factories, YAML/object constructors, expression languages, scripting engines, and JNDI-style lookups where untrusted data can influence them.
- For process execution, trace complete command arrays and any explicit shell. Validate user-controlled flags and executable paths.
- Check zip/jar extraction, file upload names, symlinks, temporary files, `normalize`, and canonical containment.
- Review regex/XML/entity expansion, body sizes, collection growth, thread pools, reactive backpressure, decompression, and parser complexity for DoS.

## Spring-specific checks

- Derive the effective `SecurityFilterChain` order and matcher coverage. A route excluded from a broad matcher may have no equivalent protection.
- Check `permitAll`, anonymous access, CSRF disablement/ignores, CORS, remember-me, session fixation, request cache, OAuth/OIDC callback validation, and JWT issuer/audience/algorithm handling in context.
- Verify method- and object-level authorization. Authentication or a URL role alone may not enforce resource ownership or tenant boundaries.
- Review SpEL and data binding, mass assignment, actuator exposure, error pages, management ports, profile-specific config, and proxy/forwarded-header trust.
- In reactive applications, confirm security context propagation and filter order across asynchronous boundaries.

## Other frameworks

For Quarkus, Micronaut, Ktor, Jakarta REST, and custom filters/interceptors, enumerate final route and interceptor composition. Validate annotations are enabled and applied to alternate and inherited methods.

## Avoid false positives

- Prepared statements and bound ORM parameters are normally safe for values. Prove attacker influence over raw query structure before reporting injection.
- XML is not automatically XXE; inspect the configured parser version and entity/DTD features.
- Deserialization risk requires an untrusted byte/object stream and a reachable gadget or dangerous custom behavior.
- A missing annotation is not a finding if a filter, interceptor, or service-layer decision reliably enforces the same boundary.

## Dependency validation

Use the project's dependency scanner or OWASP Dependency-Check when available. Resolve transitive versions, profiles, shaded dependencies, vulnerable functionality, and runtime reachability.

## Upstream references

- [Spring Security](https://github.com/spring-projects/spring-security)
- [Spring Security samples](https://github.com/spring-projects/spring-security-samples)
- [Find Security Bugs](https://github.com/find-sec-bugs/find-sec-bugs)
- [OWASP Dependency-Check](https://github.com/dependency-check/DependencyCheck)
