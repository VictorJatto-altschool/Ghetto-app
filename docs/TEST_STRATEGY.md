# Test strategy

No automated checks or hands-on device review have been completed yet.

For each vertical slice, define acceptance criteria and run type-check/build, focused unit or integration checks, and permission-negative cases. Inspect at desktop, narrow desktop, Android-sized mobile, iPhone-sized mobile, and tablet. Review keyboard use, focus, touch sizing, safe areas, reduced motion, loading/empty/offline/error states, and contrast. Multi-user features require multiple accounts and unauthorized-access attempts. Campus Life requires reconnect and room-role tests. Voice requires verified two-way audio and host control tests.

Do not infer production readiness from a successful local build.
