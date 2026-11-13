# Navigation fixes

- Fixed: Guest-to-Welcome clears prior history, and a shared route guard redirects signed-out users from protected pages and clears the stack.
- Fixed: Hardware Back exits at a signed-in root or signed-out Welcome; it leaves guest mode at the guest root and otherwise navigates back.
- Fixed: Hydration gives a stored user precedence over guest mode.
- Fixed: Removed the redundant fragment around the auth button.
- Fixed: Added navigation, persistence, and hydration regression tests; strengthened Game loading, session storage, and service-button assertions.
- Skipped: Android manifest and README cleartext note, as requested.
- Verified: `npm run typecheck`, `npm run lint`, and `npm test -- --runInBand` passed; 20 tests passed.
- Not checked: Device or emulator behavior, as requested.
