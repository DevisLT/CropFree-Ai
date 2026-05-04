# Security Specification - CropFree AI

## Data Invariants
1. A user can only access their own profile, diagnoses, crops, and tasks.
2. The `userId` field must match the authenticated user's UID on every write.
3. Immutability: `userId` and `createdAt` cannot be changed after creation.
4. Scale: All lists (symptoms, actions) are strictly bounded in size.
5. All IDs must be valid alphanumeric strings.

## The Dirty Dozen Payloads (Target: DENIED)

1. **Identity Spoofing (diagnoses)**: User A tries to save a diagnosis for User B.
   `{ "userId": "user_B_id", "mostLikelyDiagnosis": "Rust", ... }`
2. **Identity Spoofing (users)**: User A tries to modify User B's profile.
   (Operation: update /users/user_B_id)
3. **Privilege Escalation (users)**: User tries to set their own `subscriptionStatus` to "active" without payment.
   `{ "subscriptionStatus": "active" }` (on update)
4. **ID Poisoning**: Injecting 2KB toxic string as a document ID.
   (Operation: create /crops/VERY_LONG_STRING_OVER_128_CHARS)
5. **System Field Injection**: Injecting a "isVerified" field into a crop.
   `{ "name": "Rice", "isVerified": true }`
6. **Orphaned Record**: Creating a task for a non-existent crop.
   `{ "cropId": "non_existent_id", ... }`
7. **Negative Progress**: Setting crop progress to -50.
   `{ "progress": -50 }`
8. **Resource Exhaustion**: Sending 500 symptoms in a diagnosis.
   `{ "observedSymptoms": ["symptom1", ..., "symptom500"] }`
9. **Timestamp Spoofing**: Sending a fake `createdAt` in the past.
   `{ "createdAt": "2020-01-01T00:00:00Z" }`
10. **State Shortcutting**: Marking a crop as "Recovered" when progress is 0.
    `{ "status": "Recovered", "progress": 0 }`
11. **PII Scraping**: User attempts a blanket list read on `/users` collection.
    `getDocs(collection(db, "users"))`
12. **Cross-User Query**: User A tries to query User B's crops.
    `query(collection(db, "crops"), where("userId", "==", "user_B_id"))`

## Test Runner (firestore.rules.test.ts)

```typescript
// This file describes the logical tests for the security rules.
// In a real environment, this would use @firebase/rules-unit-testing.

describe("CropFree AI Security Rules", () => {
  it("denies access to other user profiles", async () => { /* ... */ });
  it("denies creating diagnoses for other users", async () => { /* ... */ });
  it("denies modifying immutable field userId", async () => { /* ... */ });
  it("denies unverified email users from writing", async () => { /* ... */ });
  it("denies invalid document IDs", async () => { /* ... */ });
});
```
