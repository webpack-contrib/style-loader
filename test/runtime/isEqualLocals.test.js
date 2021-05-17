/* eslint-env browser */

import isEqualLocals from "../../src/runtime/isEqualLocals";

describe("isEqualLocals", () => {
  it("should work", () => {
    expect(isEqualLocals()).toBe(true);
    expect(isEqualLocals({}, {})).toBe(true);
    // eslint-disable-next-line no-undefined
    expect(isEqualLocals(undefined, undefined)).toBe(true);
    expect(isEqualLocals({ foo: "bar" }, { foo: "bar" })).toBe(true);
    expect(
      isEqualLocals({ foo: "bar", bar: "baz" }, { foo: "bar", bar: "baz" })
    ).toBe(true);
    expect(
      isEqualLocals({ foo: "bar", bar: "baz" }, { bar: "baz", foo: "bar" })
    ).toBe(true);
    expect(
      isEqualLocals({ bar: "baz", foo: "bar" }, { foo: "bar", bar: "baz" })
    ).toBe(true);

    // eslint-disable-next-line no-undefined
    expect(isEqualLocals(undefined, { foo: "bar" })).toBe(false);
    // eslint-disable-next-line no-undefined
    expect(isEqualLocals({ foo: "bar" }, undefined)).toBe(false);

    expect(isEqualLocals({ foo: "bar" }, { foo: "baz" })).toBe(false);

    expect(isEqualLocals({ foo: "bar" }, { bar: "bar" })).toBe(false);
    expect(isEqualLocals({ bar: "bar" }, { foo: "bar" })).toBe(false);

    expect(isEqualLocals({ foo: "bar" }, { foo: "bar", bar: "baz" })).toBe(
      false
    );
    expect(isEqualLocals({ foo: "bar", bar: "baz" }, { foo: "bar" })).toBe(
      false
    );

    // Should never happen, but let's test it
    expect(isEqualLocals({ foo: "bar" }, { foo: true })).toBe(false);
    expect(isEqualLocals({ foo: true }, { foo: "bar" })).toBe(false);
    // eslint-disable-next-line no-undefined
    expect(isEqualLocals({ foo: "bar" }, { foo: undefined })).toBe(false);
    // eslint-disable-next-line no-undefined
    expect(isEqualLocals({ foo: undefined }, { foo: "bar" })).toBe(false);
    expect(isEqualLocals({ foo: { foo: "bar" } }, { foo: "bar" })).toBe(false);

    expect(isEqualLocals({ foo: "bar" }, { foo: "bar" }, true)).toBe(true);
    expect(isEqualLocals({ foo: "bar" }, { foo: "baz" }, true)).toBe(false);
    expect(
      isEqualLocals(
        { default: "foo", foo: "bar" },
        { default: "bar", foo: "bar" },
        true
      )
    ).toBe(true);
    expect(
      isEqualLocals(
        { default: "foo", foo: "bar" },
        { default: "bar", foo: "baz" },
        true
      )
    ).toBe(false);
  });
});
