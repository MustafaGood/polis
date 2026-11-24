import {
  assertEidRequired,
  getRequestEidAcr,
  getVerifiedEidAcr,
  hasEidXidPolicyConflict,
} from "../../src/auth/eid";

describe("eID requirements", () => {
  it.each([
    "urn:grn:authn:se:bankid:another-device:qr",
    "urn:grn:authn:se:bankid:same-device",
    "urn:grn:authn:se:frejaid",
  ])("accepts supported eID ACR %s", (acr) => {
    expect(getVerifiedEidAcr(acr)).toBe(acr);
    expect(() => assertEidRequired(true, acr)).not.toThrow();
  });

  it.each([undefined, null, "", "urn:example:password", ["bankid"]])(
    "rejects unsupported eID ACR %s",
    (acr) => {
      expect(getVerifiedEidAcr(acr)).toBeUndefined();
      expect(() => assertEidRequired(true, acr)).toThrow(
        "polis_err_eid_required"
      );
    }
  );

  it("does not require eID when the conversation setting is off", () => {
    expect(() => assertEidRequired(false, undefined)).not.toThrow();
  });

  it("does not carry participant eID assurance into another conversation", () => {
    const acr = "urn:grn:authn:se:bankid:same-device";
    expect(getRequestEidAcr(undefined, acr, false)).toBe(acr);
    expect(getRequestEidAcr(undefined, acr, true)).toBeUndefined();
    expect(getRequestEidAcr(acr, undefined, true)).toBe(acr);
  });

  it("prevents eID and XID requirements from being enabled together", () => {
    expect(hasEidXidPolicyConflict(true, true, false)).toBe(true);
    expect(hasEidXidPolicyConflict(true, false, true)).toBe(true);
    expect(hasEidXidPolicyConflict(true, false, false)).toBe(false);
    expect(hasEidXidPolicyConflict(false, true, true)).toBe(false);
  });
});
