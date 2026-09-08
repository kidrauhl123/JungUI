import test from "node:test";
import assert from "node:assert/strict";
import {
  makeTelegraphTransitionPlan,
  renderTelegraphTransitionFrame,
  telegraphDuration,
} from "../lib/telegraph-engine";
test("custom text reaches the exact final string, including Chinese and empty values", () => {
  for (const [from, to] of [
    ["MIA", "自己的项目"],
    ["longer content", "短"],
    ["", "Hello 👋"],
    ["hello", ""],
    ["same", "same"],
  ]) {
    const plan = makeTelegraphTransitionPlan(from, to, { seed: 7 });
    assert.equal(
      renderTelegraphTransitionFrame(from, to, telegraphDuration(plan), plan),
      to,
    );
  }
});
