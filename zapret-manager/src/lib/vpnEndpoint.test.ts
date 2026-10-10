import { describe, expect, it } from "vitest";

import { endpointHost, guessCountryCode } from "@/lib/vpnEndpoint";

describe("endpointHost", () => {
  it("вытаскивает хост из host:port", () => {
    expect(endpointHost("nl1.example.com:51820")).toBe("nl1.example.com");
  });

  it("работает с IPv4", () => {
    expect(endpointHost("1.2.3.4:51820")).toBe("1.2.3.4");
  });

  it("снимает квадратные скобки у IPv6", () => {
    expect(endpointHost("[2001:db8::1]:51820")).toBe("2001");
  });

  it("возвращает пустую строку для пустого значения", () => {
    expect(endpointHost("")).toBe("");
    expect(endpointHost("   ")).toBe("");
  });

  it("работает без порта", () => {
    expect(endpointHost("example.com")).toBe("example.com");
  });
});

describe("guessCountryCode", () => {
  it("определяет страну по суффиксу домена", () => {
    expect(guessCountryCode("node.amsterdam.nl:51820")).toBe("NL");
    expect(guessCountryCode("frankfurt.de:51820")).toBe("DE");
    expect(guessCountryCode("stockholm.se:51820")).toBeNull();
  });

  it("определяет страну по префиксу хоста", () => {
    expect(guessCountryCode("de1.example.com:51820")).toBe("DE");
    expect(guessCountryCode("us-west.example.net:51820")).toBe("US");
  });

  it("учитывает приоритет суффикса над префиксом", () => {
    expect(guessCountryCode("de1.example.nl:51820")).toBe("NL");
  });

  it("возвращает null для неизвестного хоста", () => {
    expect(guessCountryCode("vpn.acme.internal:51820")).toBeNull();
  });

  it("возвращает null для пустого endpoint", () => {
    expect(guessCountryCode("")).toBeNull();
  });

  it("не падает на IPv4", () => {
    expect(guessCountryCode("8.8.8.8:51820")).toBeNull();
  });
});
