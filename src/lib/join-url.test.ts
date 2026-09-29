import { describe, expect, it } from "vitest";
import { joinUrlFromHost } from "./join-url";

describe("joinUrlFromHost", () => {
  it("builds the mobile home url from the public host", () => {
    expect(joinUrlFromHost("convencao.example.com", "https")).toEqual({
      url: "https://convencao.example.com/",
      isLocal: false,
    });
  });

  it("uses the first forwarded host and marks localhost", () => {
    expect(joinUrlFromHost("localhost:3000, proxy.internal", null)).toEqual({
      url: "http://localhost:3000/",
      isLocal: true,
    });
  });
});
