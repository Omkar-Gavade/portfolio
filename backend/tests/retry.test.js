import { test } from "node:test";
import assert from "node:assert/strict";
import retry from "../src/utils/retry.js";
import { createDeadline } from "../src/utils/withTimeout.js";

const alwaysRetryable = () => true;

test("returns the first successful result without retrying", async () => {
  let calls = 0;
  const result = await retry(
    async () => {
      calls += 1;
      return "ok";
    },
    { maxAttempts: 3, baseDelayMs: 1, isRetryable: alwaysRetryable }
  );

  assert.equal(result, "ok");
  assert.equal(calls, 1);
});

test("retries transient failures up to maxAttempts", async () => {
  let calls = 0;
  const result = await retry(
    async () => {
      calls += 1;
      if (calls < 3) throw new Error("transient");
      return "recovered";
    },
    { maxAttempts: 3, baseDelayMs: 1, isRetryable: alwaysRetryable }
  );

  assert.equal(result, "recovered");
  assert.equal(calls, 3);
});

test("does not retry a permanent failure", async () => {
  let calls = 0;
  await assert.rejects(
    retry(
      async () => {
        calls += 1;
        throw new Error("permanent");
      },
      { maxAttempts: 5, baseDelayMs: 1, isRetryable: () => false }
    ),
    /permanent/
  );

  assert.equal(calls, 1, "permanent failures must not be retried");
});

test("surfaces the last error when attempts are exhausted", async () => {
  let calls = 0;
  await assert.rejects(
    retry(
      async () => {
        calls += 1;
        throw new Error(`fail-${calls}`);
      },
      { maxAttempts: 3, baseDelayMs: 1, isRetryable: alwaysRetryable }
    ),
    /fail-3/
  );
});

test("stops retrying once the deadline cannot absorb the backoff", async () => {
  const deadline = createDeadline(0); // already exhausted
  let calls = 0;

  await assert.rejects(
    retry(
      async () => {
        calls += 1;
        throw new Error("transient");
      },
      { maxAttempts: 5, baseDelayMs: 500, deadline, isRetryable: alwaysRetryable }
    ),
    /transient/
  );

  assert.equal(calls, 1, "must not sleep into an expired budget");
});
