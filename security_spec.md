# Security Specification for CollabTask

## Data Invariants
1. A **Project** must always have an `adminId` who is a valid authenticated user.
2. Only the `adminId` of a project can add/remove members.
3. A **Task** must belong to a valid `projectId`.
4. Access to a **Task** (view/create/update/delete) is restricted to members of its parent **Project**.
5. Only the `adminId` of the parent project can delete a task.
6. A user's profile can only be written by that user.

## The Dirty Dozen Payloads
1. **Unauthenticated Project Creation**: Attempt to create a project without a valid auth token.
2. **Identity Spoofing**: Attempt to create a project where `adminId` != `request.auth.uid`.
3. **Privilege Escalation**: Attempt for a member (not admin) to add themselves as an admin of a project.
4. **Member Hijacking**: Attempt for a user to join a project they were not added to by an admin.
5. **Orphaned Task**: Attempt to create a task with a `projectId` that doesn't exist.
6. **Task Extraction**: Attempt to read tasks from a project the user is not a member of.
7. **Cross-Project Update**: Attempt to move a task from Project A (authorized) to Project B (unauthorized).
8. **Shadow Field Injection**: Attempt to create a task with hidden fields like `isSystemAdmin: true`.
9. **Terminal State Bypass**: Attempt to update a task after it has been marked as a sensitive terminal state (if applicable).
10. **Identity Integrity Loss**: Attempt to change the `creatorId` of a task after creation.
11. **Denial of Wallet**: Attempt to inject massive (>1MB) strings into task titles.
12. **Unverified User Write**: Attempt to write data from an account with an unverified email.

## Next Steps
- Implement `firestore.rules` based on these invariants.
- Set up `src/lib/firebase-error-handler.ts`.
