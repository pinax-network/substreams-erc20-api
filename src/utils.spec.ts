import { expect, test } from "bun:test";
import { formatAddress, checkValidAddress, getAddress, parseBlockId, parseTimestamp } from "./utils.js";
import { addTimestampBlockFilter } from "./queries.js";
const address = "0xdac17f958d2ee523a2206206994597c13d831ec7";
test("formatAddress", () => {
    expect(formatAddress(address)).toBe("dac17f958d2ee523a2206206994597c13d831ec7")
});


test("checkValidAddress", () => {
    checkValidAddress(address)
    expect(() => checkValidAddress(address)).not.toThrow();
    expect(() => checkValidAddress("foobar")).toThrow("Invalid address");
});

test("addTimestampBlockFilter", () => {
    let where: any[] = [];
    const searchParams = new URLSearchParams({ address: address, greater_or_equals_by_timestamp: "1697587200", less_or_equals_by_timestamp: "1697587100", greater_or_equals_by_block_number: "123", less_or_equals_by_block_number: "123" });
    addTimestampBlockFilter(searchParams, where)
    expect(where).toContain("block_number >= 123");
    expect(where).toContain("block_number <= 123");
    expect(where).toContain("toUnixTimestamp(timestamp) >= 1697587200");
    expect(where).toContain("toUnixTimestamp(timestamp) <= 1697587100");
});

test("parseBlockId", () => {
    expect(parseBlockId("0x123") as string).toBe("123");
});

test("parseTimestamp", () => {
    expect(parseTimestamp("1697587100")).toBe(1697587100);
    expect(parseTimestamp("1697587100000")).toBe(1697587100);
    expect(parseTimestamp("awdawd")).toBeNaN();
    expect(parseTimestamp(null)).toBeUndefined();
});


test("getAddress", () => {
    expect(() => getAddress(new URLSearchParams({ address: address }), "address", false)).not.toThrow();
    expect(() => getAddress(new URLSearchParams({ address: address }), "address", true)).not.toThrow();
    expect(() => getAddress(new URLSearchParams({ address: "" }), "address", true)).toThrow("Missing [address] parameter");
    expect(() => getAddress(new URLSearchParams({ address: "foobar" }), "address")).toThrow("Invalid address");
});
