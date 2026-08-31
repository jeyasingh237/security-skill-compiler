# Native C and C++ audit module

## Establish build and attack surface

Read build systems, compile/link flags, target platforms, exported APIs, protocol/file parsers, privilege model, IPC/network entry points, FFI, plugins, and sandbox configuration. Account for preprocessor branches, optional features, generated code, and vendored libraries.

## High-value review paths

- Map every attacker-controlled byte stream and metadata field through parsing, length arithmetic, allocation, indexing, copying, casting, and lifetime transitions.
- Check integer overflow/truncation/sign conversion before allocation or bounds checks; confirm units and types remain consistent across layers.
- Review out-of-bounds read/write, use-after-free, double free, uninitialized data, invalid downcasts, iterator/pointer invalidation, format strings, variadic APIs, and ownership transfer.
- Inspect C-string termination, embedded NUL, encoding conversion, path normalization, symlinks, archive extraction, temporary files, and TOCTOU.
- Audit parser state machines for contradictory lengths, nested depth, decompression ratios, cyclic structures, partial records, duplicate fields, and error recovery.
- Review concurrency: refcounts, lock ordering, signal handlers, callbacks, cancellation, teardown, shared-memory validation, and races between check and use.
- Trace commands, environment, dynamic library/plugin paths, configuration search paths, and privileged helpers for injection or preloading/hijacking.
- Check cryptographic API return values, entropy errors, buffer sizes, nonce/key lifecycle, and fail-open error paths.

## Dynamic validation

- Reproduce against the exact build flags and sanitizer configuration when practical.
- Use AddressSanitizer and UndefinedBehaviorSanitizer for memory/UB candidates; use MemorySanitizer where the toolchain and dependencies support it; use ThreadSanitizer for plausible races.
- Extract a minimal parser/function harness when building the full target is expensive. Preserve the same types, compiler semantics, and relevant preconditions.
- Fuzz the narrow boundary with a seed that reaches the candidate. A crash alone is not enough: minimize it and explain the violated invariant and reachable impact.

## Avoid false positives

- A dangerous API name is not proof of overflow; establish attacker control and missing length guarantees.
- Undefined behavior claims depend on compiler, types, lifetime, and actual path. Test or cite the language/runtime rule.
- A local crash is not a remote DoS unless the input crosses a remote/untrusted boundary and the process/service impact is meaningful.
- Compiler hardening and sandboxing affect impact but do not erase a reachable memory-safety violation; describe both layers accurately.

## Dependency validation

Resolve vendored/submodule versions and build configuration. Confirm a known CVE applies to the enabled code and platform. Do not match banners or directory names alone.

## Upstream references

- [LLVM sanitizers and compiler documentation](https://github.com/llvm/llvm-project/tree/main/clang/docs)
- [Google OSS-Fuzz](https://github.com/google/oss-fuzz)
- [C++ Core Guidelines](https://github.com/isocpp/CppCoreGuidelines)
- [OWASP native application security material](https://github.com/OWASP/CheatSheetSeries)
