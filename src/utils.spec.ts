import { expect, test } from "bun:test";
import { formatAddress, checkValidAddress, getAddress } from "./utils";

const address = "0xdac17f958d2ee523a2206206994597c13d831ec7";

test("formatAddress", () => {
    expect(formatAddress(address)).toBe("dac17f958d2ee523a2206206994597c13d831ec7")
});


test("checkValidAddress", () => {
    checkValidAddress(address)
    expect(() => checkValidAddress(address)).not.toThrow();
    expect(() => checkValidAddress("foobar")).toThrow("Invalid address");
});

test("getAddress", () => {
    expect(() => getAddress(new URLSearchParams({address: address}), "address", false)).not.toThrow();
    expect(() => getAddress(new URLSearchParams({address: address}), "address", true)).not.toThrow();
    expect(() => getAddress(new URLSearchParams({address: ""}), "address", true)).toThrow("Missing [address] parameter");
    expect(() => getAddress(new URLSearchParams({address: "foobar"}), "address")).toThrow("Invalid address");
});
