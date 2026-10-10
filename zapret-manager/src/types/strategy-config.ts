export interface StrategyFilterGroup {
  args: string[];
  usesGeneralHostlist: boolean;
  usesAllIpset: boolean;
}

export interface StrategyConfig {
  sourceFilename: string;
  winwsPath: string;
  wfTcp: string | null;
  wfUdp: string | null;
  groups: StrategyFilterGroup[];
}
