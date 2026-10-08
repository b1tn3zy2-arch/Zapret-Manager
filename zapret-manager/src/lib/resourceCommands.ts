import { invoke } from "@tauri-apps/api/core";

import type { InitReport, IntegrityReport, RestoreReport } from "@/types";

export async function initResources(): Promise<InitReport> {
  return invoke<InitReport>("init_resources");
}

export async function checkIntegrity(): Promise<IntegrityReport> {
  return invoke<IntegrityReport>("check_resources_integrity");
}

export async function restoreBundled(): Promise<RestoreReport> {
  return invoke<RestoreReport>("restore_bundled_strategies");
}

export async function fetchResourcesVersion(): Promise<string> {
  return invoke<string>("get_resources_version");
}

export async function fetchResourcesLayout(): Promise<string[]> {
  return invoke<string[]>("get_resources_layout");
}

export async function fetchStrategiesPath(): Promise<string> {
  return invoke<string>("get_resources_strategies_path");
}

export async function readLicense(name: string): Promise<string> {
  return invoke<string>("read_license_text", { name });
}
