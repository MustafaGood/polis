import { jest } from "@jest/globals";
import pg from "../../src/db/pg-query";

jest.mock("../../src/db/pg-query", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import { getOrCreateUserIDFromOidcSub } from "../../src/auth/create-user";

describe("OIDC user creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an eID user when the provider does not return an email", async () => {
    const query = pg.query as jest.Mock;
    query.mockImplementation(
      (statement: string, _values: unknown[], callback: Function) => {
        let rows: { uid?: number; oidc_sub?: string }[] = [];

        if (statement.includes("INSERT INTO users")) {
          rows = [{ uid: 42 }];
        } else if (statement.includes("INSERT INTO oidc_user_mappings")) {
          rows = [{ uid: 42 }];
        }

        callback(null, { rows });
      }
    );

    await expect(
      getOrCreateUserIDFromOidcSub("idura-subject-1", {
        name: "BankID User",
      })
    ).resolves.toBe(42);

    const userInsert = query.mock.calls.find(([statement]) =>
      String(statement).includes("INSERT INTO users")
    );
    expect(userInsert?.[1][0]).toBeNull();
    expect(userInsert?.[1][1]).toBe("BankID User");
    expect(userInsert?.[1][2]).toBeNull();
  });
});
