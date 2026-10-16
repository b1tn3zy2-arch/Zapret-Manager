import { describe, expect, it } from "vitest";

import {
  migratePersistedState,
  useVpnCoreStore,
} from "@/stores/useVpnCoreStore";
import type { SubscriptionServer } from "@/types";

function server(id: string): SubscriptionServer {
  return {
    id,
    name: id,
    protocol: "vless",
    host: `${id}.example.com`,
    port: 443,
    link: `vless://uuid@${id}.example.com:443#${id}`,
    transport: "tcp",
    security: "reality",
  };
}

describe("useVpnCoreStore: удаление серверов", () => {
  it("удаляет сервер из списка", () => {
    const store = useVpnCoreStore.getState();

    store.setServers([server("a"), server("b")]);
    useVpnCoreStore.getState().removeServer("a");

    expect(useVpnCoreStore.getState().servers.map((item) => item.id)).toEqual([
      "b",
    ]);
  });

  it("не возвращает удалённый сервер после обновления подписки", () => {
    const store = useVpnCoreStore.getState();

    store.setServers([server("a"), server("b")]);
    useVpnCoreStore.getState().removeServer("a");

    // подписка отдаёт полный список, скрытый сервер обязан остаться скрытым
    useVpnCoreStore.getState().setServers([server("a"), server("b")]);

    expect(useVpnCoreStore.getState().servers.map((item) => item.id)).toEqual([
      "b",
    ]);
  });

  it("сбрасывает активный сервер, если его удалили", () => {
    const store = useVpnCoreStore.getState();

    store.setServers([server("a")]);
    useVpnCoreStore.getState().setActiveServer("a");
    useVpnCoreStore.getState().removeServer("a");

    expect(useVpnCoreStore.getState().activeServerId).toBeNull();
  });

  it("очистка подписки снимает и скрытые серверы", () => {
    const store = useVpnCoreStore.getState();

    store.setServers([server("a")]);
    useVpnCoreStore.getState().removeServer("a");
    useVpnCoreStore.getState().clearSubscription();
    useVpnCoreStore.getState().setServers([server("a")]);

    expect(useVpnCoreStore.getState().servers.map((item) => item.id)).toEqual([
      "a",
    ]);
  });

  it("не сбрасывает активный сервер, если он остался в подписке", () => {
    const store = useVpnCoreStore.getState();

    store.setServers([server("a"), server("b")]);
    useVpnCoreStore.getState().setActiveServer("b");
    useVpnCoreStore.getState().removeServer("a");
    useVpnCoreStore.getState().setServers([server("a"), server("b")]);

    expect(useVpnCoreStore.getState().activeServerId).toBe("b");
  });
});

describe("migratePersistedState", () => {
  // Серверы, сохранённые прошлой сборкой, не содержат полей транспорта и
  // шифрования. Такие записи роняли рендер списка и весь интерфейс.
  it("выбрасывает серверы без новых полей", () => {
    const legacy = [
      {
        id: "old",
        name: "Old",
        protocol: "vless",
        host: "a",
        port: 443,
        link: "l",
      },
      { ...server("new"), id: "new", name: "New" },
    ] as unknown as SubscriptionServer[];

    const migrated = migratePersistedState({
      subscriptionUrl: "https://sub.example.com/list",
      servers: legacy,
      hiddenServerIds: ["old"],
      activeServerId: "old",
    });

    expect(migrated?.servers.map((item) => item.id)).toEqual(["new"]);
    expect(migrated?.activeServerId).toBeNull();
    expect(migrated?.hiddenServerIds).toEqual([]);
  });

  it("сохраняет полные серверы и активный сервер", () => {
    const migrated = migratePersistedState({
      subscriptionUrl: "https://sub.example.com/list",
      servers: [server("a"), server("b")],
      hiddenServerIds: [],
      activeServerId: "b",
    });

    expect(migrated?.servers).toHaveLength(2);
    expect(migrated?.activeServerId).toBe("b");
  });
});
