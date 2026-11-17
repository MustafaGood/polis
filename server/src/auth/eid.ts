const VERIFIED_EID_ACR_VALUES = new Set([
  "urn:grn:authn:se:bankid:another-device:qr",
  "urn:grn:authn:se:bankid:same-device",
  "urn:grn:authn:se:frejaid",
]);

export function getVerifiedEidAcr(acr: unknown): string | undefined {
  return typeof acr === "string" && VERIFIED_EID_ACR_VALUES.has(acr)
    ? acr
    : undefined;
}

export function getRequestEidAcr(
  oidcAcr: unknown,
  participantAcr: unknown,
  conversationMismatch: boolean
): string | undefined {
  return (
    getVerifiedEidAcr(oidcAcr) ||
    (conversationMismatch ? undefined : getVerifiedEidAcr(participantAcr))
  );
}

export function assertEidRequired(
  eidRequired: boolean,
  acr: unknown
): void {
  if (eidRequired && !getVerifiedEidAcr(acr)) {
    throw new Error("polis_err_eid_required");
  }
}

export function hasEidXidPolicyConflict(
  eidRequired: boolean,
  xidRequired: boolean,
  useXidWhitelist: boolean
): boolean {
  return eidRequired && (xidRequired || useXidWhitelist);
}
