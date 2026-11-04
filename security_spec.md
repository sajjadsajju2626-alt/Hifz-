# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Global Default-Deny**: Any path not explicitly matched in `firestore.rules` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity**: All write operations require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`), and `incoming().ownerId == request.auth.uid`.
3. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates the path document ID via `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Strict Blueprint Key Enforcement**: Every `create` operation enforces `hasAll(requiredKeys) && hasOnly(allowedKeys)`. Every `update` operation starts with `isValid[Entity](incoming())` and restricts mutated fields via action-based `incoming().diff(existing()).affectedKeys().hasOnly(...)`.
5. **Immutability & Temporal Integrity**: `ownerId` and `createdAt` can never change on `update`. On `create`, `createdAt == request.time` and `updatedAt == request.time`. On `update`, `updatedAt == request.time`.
6. **Terminal State Locking**: Once a `MemorizationSchedule` reaches `status == 'archived'` or a `FeedbackAlert` reaches `status == 'resolved'`, non-admin updates are blocked (`existing().status != 'archived'` / `existing().status != 'resolved' || isAdmin()`).
7. **Secure List Queries & PII Isolation**: `allow list` never uses blanket `isSignedIn()`; it enforces `resource.data.ownerId == request.auth.uid || isAdmin()`. `students` containing `guardianPhone` and `pin` are only readable by `resource.data.ownerId == request.auth.uid || isAdmin()`.

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on `students`**: Valid student payload plus `"isSuperUser": true` -> Rejected by `hasOnly()`.
2. **Identity Spoofing on `hifz_logs`**: Setting `ownerId: "victim_uid_999"` when `request.auth.uid == "attacker_uid"` -> Rejected by `data.ownerId == request.auth.uid`.
3. **Unverified Email Admin Spoof**: `request.auth.token.email == "sajjadsajju2626@gmail.com"` with `email_verified: false` -> Rejected by `request.auth.token.email_verified == true`.
4. **ID Poisoning Attack**: Creating `/students/bad$id!with/slashes` or 2KB ID -> Rejected by `isValidId(studentId)`.
5. **Denial-of-Wallet String Overflow**: Submitting a 50,000-character `note` in `hifz_logs` -> Rejected by `data.note.size() <= 400`.
6. **Unbounded Array Poisoning**: Submitting `akhlaqTags` with 50 items or non-string first element `[12345]` -> Rejected by `data.akhlaqTags.size() <= 10 && (data.akhlaqTags.size() == 0 || (data.akhlaqTags[0] is string && data.akhlaqTags[0].size() <= 60))`.
7. **Immortal Field Mutation**: Updating `createdAt` or `ownerId` on an existing `schedules/{scheduleId}` document -> Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`.
8. **Client Timestamp Forgery**: Creating a `notices/{noticeId}` document with a past or future `createdAt` timestamp != `request.time` -> Rejected by `data.createdAt == request.time`.
9. **Terminal State Bypass**: Updating a `schedules/{scheduleId}` document whose `existing().status == 'archived'` as a non-admin -> Rejected by terminal state lock.
10. **Value Poisoning on Update**: Updating `juzCompleted` on `/students/{studentId}` to `"thirty"` (string) or `999` -> Rejected because `isValidStudent(incoming())` wraps the entire `allow update` expression and enforces `data.juzCompleted is number && data.juzCompleted >= 0 && data.juzCompleted <= 30`.
11. **Unauthorized PII Read (`students`)**: Authenticated user `user_B` attempting `get` or `list` on `user_A`'s student record containing `guardianPhone` and `pin` -> Rejected by `existing().ownerId == request.auth.uid || isAdmin()`.
12. **Self-Assigned Admin Escalation**: Regular user attempting `create` on `/admins/{uid}` -> Rejected because `/admins/{adminUid}` only allows writes by the bootstrapped super-admin.

## 3. Red Team Conflict Report Summary

- **Identity Spoofing**: Blocked on all 7 collections via `data.ownerId == request.auth.uid` on create and `incoming().ownerId == existing().ownerId` on update.
- **State Shortcutting / Terminal State**: Locked on `schedules` (`status != 'archived'`) and `alerts` (`status != 'resolved'`).
- **Resource Poisoning**: Every string has `.size() <= MAX`, every number has range bounds, and `akhlaqTags` list has `.size() <= 10` and element type check.
- **Update Validation Helper Presence**: Every `allow update` block begins with `isSignedIn() && isVerified() && isValidId(...) && isValid[Entity](incoming())`.
