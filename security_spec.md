# Security Specification for Piano Quest

## 1. Data Invariants
- A user can only write to their own profile document.
- XP can only be incremented, never decremented by the user (rule will ensure validity of incoming data).
- A score record must belong to the authenticated user.
- Usernames and photo URLs must be strings of reasonable length.

## 2. The "Dirty Dozen" Payloads (Denial Examples)
1. User A tries to update User B's XP.
2. Unauthenticated user tries to write a score.
3. User tries to set XP to a negative value.
4. User tries to inject a 1MB string into their `displayName`.
5. User tries to overwrite `uid` with a different ID to spoof identity.
6. User tries to delete another user's profile.
7. User tries to create a score record with `userId` not matching their own.
8. User tries to update an immutable field (e.g. `userId` in a score).
9. User tries to batch write 500 records at once (standard Firestore limit applies, but we check schema size).
10. User tries to set `lastActive` to a future date manually (must be request.time).
11. User tries to read private PII if we had any (we don't for now, but we restrict read to signed-in).
12. User tries to list all user profiles without filtering by their own (Actually, for leaderboards, public reads of XP are allowed, but writes are restricted).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these constraints using @firebase/rules-unit-testing. 
(Omitted full test file for brevity in this step, but logic follows these principles).
