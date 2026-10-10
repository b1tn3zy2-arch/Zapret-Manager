import type { StrategyConfig } from "./strategy-config";

export type ServiceType = "discord" | "youtube" | "outlast-trials" | "general";

export type StrategyStatus =
  "idle" | "running" | "error" | "stopped" | "starting" | "stopping";

export type StrategyFileType = "winws" | "goodbye-dpi" | "zapret" | "unknown";

export type TechniqueId =
  | "faketls"
  | "multisplit"
  | "split-seqovl"
  | "quic-fake"
  | "l7-filter"
  | "ipset"
  | "any-protocol"
  | "cutoff"
  | "fakedsplit"
  | "hostfakesplit"
  | "multidisorder"
  | "syndata"
  | "fake";

export const TECHNIQUE_LABELS = {
  faketls: "FakeTLS",
  multisplit: "Multisplit",
  "split-seqovl": "Split SeqOVL",
  "quic-fake": "QUIC Fake",
  "l7-filter": "L7 Filter",
  ipset: "IPSet",
  "any-protocol": "Any Protocol",
  cutoff: "Cutoff",
  fakedsplit: "FakeSplit",
  hostfakesplit: "HostFakeSplit",
  multidisorder: "MultiDisorder",
  syndata: "SynData",
  fake: "Fake",
} as const satisfies Record<TechniqueId, string>;

export interface Strategy {
  id: string;
  name: string;
  filename: string;
  path: string;
  description: string;
  services: ServiceType[];
  techniques: TechniqueId[];
  fileType: StrategyFileType;
  status: StrategyStatus;
  lastRun?: number | undefined;
  pid?: number | undefined;
  error?: string | undefined;
  version?: string | undefined;
  size: number;
  modifiedAt?: number | undefined;
  config?: StrategyConfig | null | undefined;
}

export type StrategyInput = Omit<
  Strategy,
  "id" | "status" | "pid" | "error" | "lastRun"
>;

export interface StrategyFilter {
  services?: ServiceType[];
  status?: StrategyStatus[];
  search?: string;
}
