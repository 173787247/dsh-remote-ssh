import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertAllowedCommand, resolveHost, listHosts } from "../lib/ssh.js";

describe("remote-ssh guards", () => {
  it("lists hosts", () => {
    assert.equal(listHosts([{ id: "aix1", host: "10.0.0.5", os: "aix" }]).length, 1);
  });
  it("resolves host", () => {
    const h = resolveHost([{ id: "mac", host: "mac.local", os: "darwin" }], "mac");
    assert.equal(h.host, "mac.local");
  });
  it("allows df", () => {
    assert.deepEqual(assertAllowedCommand(["df", "-h"], ["df", "uname"]), ["df", "-h"]);
  });
  it("blocks shell metachar", () => {
    assert.throws(() => assertAllowedCommand(["uname", ";rm"], ["uname"]), /metacharacter/);
  });
  it("blocks unknown cmd", () => {
    assert.throws(() => assertAllowedCommand(["curl", "x"], ["uname"]), /allowCommands/);
  });
  it("blocks mutate without confirm", () => {
    assert.throws(
      () => assertAllowedCommand(["rm", "-rf", "/tmp/x"], ["rm"], { allowMutate: true, confirm: false }),
      /confirm/,
    );
  });
});
