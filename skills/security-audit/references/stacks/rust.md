# Rust audit module

## Establish crate boundaries

Read workspace manifests and lockfiles, features, build scripts, proc macros, binaries, public libraries, network entry points, and FFI. Feature flags, target configuration, and `build.rs` can change both behavior and supply-chain exposure.

## High-value review paths

- Inventory every `unsafe` block, `unsafe fn`, raw pointer, union, `transmute`, manual allocation, `MaybeUninit`, pinning invariant, and unsafe trait implementation reachable from untrusted input.
- Trace lengths and indexes through integer casts, allocation, slicing, parsers, decompression, and FFI. Safe Rust can still panic or exhaust resources.
- Check FFI ownership, aliasing, lifetimes, string termination/encoding, callback reentrancy, unwind boundaries, and thread safety.
- `std::process::Command` does not invoke a shell by default. Still validate executable selection, arguments that become options, environment, working directory, and any explicit shell invocation.
- Inspect `serde` tagged/untagged enums, defaults, flattening, custom deserializers, recursion/depth, duplicate keys, and differences between validators and downstream formats.
- Review path normalization, symlinks, archive extraction, temporary files, and canonical containment.
- For SQLx/Diesel, distinguish checked/parameterized values from `format!`-built SQL, raw fragments, and dynamic identifiers.
- Audit async cancellation, locks held across `.await`, task spawning, retries, and partial writes for security-relevant state corruption or DoS.

## Web/framework checks

- For Axum, Actix Web, Rocket, Warp, and Tonic, enumerate final route/service composition and middleware/layer scope.
- Verify extractors validate shape but do not substitute for caller, object, or tenant authorization.
- Check request body/message limits, proxy header trust, error conversion, CORS, WebSocket origin/action authorization, and file responses.

## Avoid false positives

- The presence of `unsafe` is a review target, not a vulnerability. State the violated invariant and a reachable trigger.
- A panic is not automatically a security issue. Establish that an attacker can cause process/service impact beyond ordinary request failure.
- Rust memory safety does not prevent SSRF, injection, authorization errors, crypto misuse, races at external systems, or business-logic bugs.

## Dependency validation

Run `cargo audit` or the repository's existing RustSec consumer. Confirm target/features, vulnerable call reachability, and whether an advisory is informational soundness versus demonstrated security impact in this application.

## Upstream references

- [RustSec tooling and cargo-audit](https://github.com/rustsec/rustsec)
- [RustSec advisory database](https://github.com/rustsec/advisory-db)
- [Rust unsafe-code guidelines](https://github.com/rust-lang/unsafe-code-guidelines)
- [Rust Clippy](https://github.com/rust-lang/rust-clippy)
