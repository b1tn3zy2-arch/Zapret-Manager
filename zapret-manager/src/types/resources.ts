export type InitStage =
  "copying-zapret" | "copying-strategies" | "finalizing" | "idle";

export interface InitReport {
  firstRun: boolean;
  updated: boolean;
  strategiesCount: number;
  resourcesVersion: string;
  extractedBytes: number;
  available: boolean;
}

export interface InitProgress {
  stage: InitStage;
  percent: number;
  currentFile: string;
}

export interface IntegrityReport {
  total: number;
  missing: string[];
  modified: string[];
  ok: boolean;
  resourcesVersion: string;
}

export interface RestoreReport {
  restored: number;
  skipped: number;
  resourcesVersion: string;
}
