// Обрабатываем конструкцию: export.
export const en = {
  // Обрабатываем конструкцию: common.
  common: {
    // Обрабатываем конструкцию: hint.
    hint: "Hint",
    // Обрабатываем конструкцию: cancel.
    cancel: "Cancel",
    // Обрабатываем конструкцию: confirm.
    confirm: "Confirm",
    // Обрабатываем конструкцию: close.
    close: "Close",
    // Обрабатываем конструкцию: retry.
    retry: "Retry",
    // Обрабатываем конструкцию: reset.
    reset: "Reset",
    // Обрабатываем конструкцию: refresh.
    refresh: "Refresh",
    // Обрабатываем конструкцию: delete.
    delete: "Delete",
    // Обрабатываем конструкцию: unknown.
    unknown: "unknown",
    // Обрабатываем конструкцию: noData.
    noData: "no data",
    // Обрабатываем конструкцию: pause.
    pause: "Pause",
    // Обрабатываем конструкцию: resume.
    resume: "Resume",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: nav.
  nav: {
    // Обрабатываем конструкцию: dashboard.
    dashboard: "Dashboard",
    // Обрабатываем конструкцию: strategies.
    strategies: "Strategies",
    // Обрабатываем конструкцию: games.
    games: "Games",
    // Обрабатываем конструкцию: monitor.
    monitor: "Monitor",
    // Обрабатываем конструкцию: logs.
    logs: "Logs",
    // Обрабатываем конструкцию: settings.
    settings: "Settings",
    // Обрабатываем конструкцию: about.
    about: "About",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: connection.
  connection: {
    // Обрабатываем конструкцию: aria.
    aria: "Connection status: {status}",
    // Обрабатываем конструкцию: connected.
    connected: "Connected",
    // Обрабатываем конструкцию: connecting.
    connecting: "Connecting",
    // Обрабатываем конструкцию: disconnected.
    disconnected: "Disconnected",
    // Обрабатываем конструкцию: vpn.
    vpn: "VPN",
    // Обрабатываем конструкцию: error.
    error: "Error",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: titleBar.
  titleBar: {
    // Обрабатываем конструкцию: exitFullscreen.
    exitFullscreen: "Exit fullscreen",
    // Обрабатываем конструкцию: fullscreen.
    fullscreen: "Fullscreen",
    // Обрабатываем конструкцию: fullscreenHint.
    fullscreenHint: "Fullscreen (F11)",
    // Обрабатываем конструкцию: minimize.
    minimize: "Minimize window",
    // Обрабатываем конструкцию: restore.
    restore: "Restore window",
    // Обрабатываем конструкцию: maximize.
    maximize: "Maximize window",
    // Обрабатываем конструкцию: close.
    close: "Close window",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: sidebar.
  sidebar: {
    // Обрабатываем конструкцию: expand.
    expand: "Expand menu",
    // Обрабатываем конструкцию: collapse.
    collapse: "Collapse menu",
    // Обрабатываем конструкцию: mainNav.
    mainNav: "Main navigation",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: validation.
  validation: {
    // Обрабатываем конструкцию: emptyValue.
    emptyValue: "Value is empty",
    // Обрабатываем конструкцию: invalidDomain.
    invalidDomain: "Invalid domain",
    // Обрабатываем конструкцию: invalidIpRange.
    invalidIpRange: "Invalid IP or CIDR",
    // Обрабатываем конструкцию: portOutOfRange.
    portOutOfRange: "Port outside {min}–{max}",
    // Обрабатываем конструкцию: domainTooLong.
    domainTooLong: "Domain must not be empty or longer than 253 characters",
    // Обрабатываем конструкцию: domainChars.
    domainChars: "Domain must contain Latin letters, digits and hyphens",
    // Обрабатываем конструкцию: portInteger.
    portInteger: "Port must be a whole number",
    // Обрабатываем конструкцию: portRange.
    portRange: "Port must be within 1–65535",
    // Обрабатываем конструкцию: octetTooLarge.
    octetTooLarge: "Address octet is greater than 255",
    // Обрабатываем конструкцию: ipFamily.
    ipFamily: "Address must be IPv4 or IPv6",
    // Обрабатываем конструкцию: cidrExample.
    cidrExample: "Provide an address with a prefix, for example 10.0.0.0/8",
    // Обрабатываем конструкцию: cidrMaskRange.
    cidrMaskRange: "Prefix must be a number from 0 to {max}",
    // Обрабатываем конструкцию: pathEmpty.
    pathEmpty: "Path must not be empty",
    // Обрабатываем конструкцию: pathAbsolute.
    pathAbsolute: "A full path is required, for example C:\\strategies",
    // Обрабатываем конструкцию: pathTraversal.
    pathTraversal: "Path must not contain folder traversal",
    // Обрабатываем конструкцию: versionFormat.
    versionFormat: "Version must look like 1.10.3",
    // Обрабатываем конструкцию: extensionsOnly.
    extensionsOnly: "Only {list} are supported",
    // Обрабатываем конструкцию: fileTooLarge.
    fileTooLarge: "File is larger than 1 MB",
    // Обрабатываем конструкцию: redacted.
    redacted: "redacted",
    // Обрабатываем конструкцию: domainLooksWrong.
    domainLooksWrong: "does not look like a domain",
    // Обрабатываем конструкцию: cidrExpected.
    cidrExpected: "expected CIDR, for example 203.0.113.0/24",
    // Обрабатываем конструкцию: vpnSourceEmpty.
    vpnSourceEmpty: "Paste a subscription or config link",
    // Обрабатываем конструкцию: vpnSourceTooLong.
    vpnSourceTooLong: "The link is too long",
    // Обрабатываем конструкцию: vpnSourceFormat.
    vpnSourceFormat:
      // Обрабатываем конструкцию: Expected an https subscription link or a vless, vmess, ….
      "Expected an https subscription link or a vless, vmess, trojan, ss link",
    // Обрабатываем конструкцию: invalidFilePath.
    invalidFilePath: "Invalid file path",
    // Обрабатываем конструкцию: invalidStrategiesFolder.
    invalidStrategiesFolder: "Invalid strategies folder",
    // Обрабатываем конструкцию: invalidVersion.
    invalidVersion: "Invalid version",
    // Обрабатываем конструкцию: invalidBackupPath.
    invalidBackupPath: "Invalid backup path",
    // Обрабатываем конструкцию: expectedRepo.
    expectedRepo: "Expected owner/name",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: geo.
  geo: {
    // Обрабатываем конструкцию: morning.
    morning: "Good morning",
    // Обрабатываем конструкцию: afternoon.
    afternoon: "Good afternoon",
    // Обрабатываем конструкцию: evening.
    evening: "Good evening",
    // Обрабатываем конструкцию: night.
    night: "Good night",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: units.
  units: {
    // Обрабатываем конструкцию: domainOne.
    domainOne: "domain",
    // Обрабатываем конструкцию: domainTwo.
    domainTwo: "domains",
    // Обрабатываем конструкцию: domainFew.
    domainFew: "domains",
    // Обрабатываем конструкцию: portOne.
    portOne: "port",
    // Обрабатываем конструкцию: portTwo.
    portTwo: "ports",
    // Обрабатываем конструкцию: portFew.
    portFew: "ports",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: errors.
  errors: {
    // Обрабатываем конструкцию: unknown.
    unknown: "Unknown error",
    // Обрабатываем конструкцию: ipcUnknown.
    ipcUnknown: "Unknown IPC error",
    // Обрабатываем конструкцию: ipcSchema.
    ipcSchema:
      // Обрабатываем конструкцию: Tauri call error: response for {command} failed schema ….
      "Tauri call error: response for {command} failed schema validation",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: trafficMonitor.
  trafficMonitor: {
    // Обрабатываем конструкцию: title.
    title: "Zapret — traffic monitor",
    // Обрабатываем конструкцию: nowLabel.
    nowLabel: "now",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: exportLogs.
  exportLogs: {
    // Обрабатываем конструкцию: title.
    title: "Export logs",
    // Обрабатываем конструкцию: textFile.
    textFile: "Text file",
    // Обрабатываем конструкцию: logFile.
    logFile: "Log file",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: system.
  system: {
    // Обрабатываем конструкцию: none.
    none: "none",
    // Обрабатываем конструкцию: recentLogs.
    recentLogs: "Recent logs:",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: updateMeta.
  updateMeta: {
    // Обрабатываем конструкцию: unknownVersion.
    unknownVersion: "unknown",
    // Обрабатываем конструкцию: unknownDate.
    unknownDate: "date unknown",
    // Обрабатываем конструкцию: remainingUnknown.
    remainingUnknown: "remaining time unknown",
    // Обрабатываем конструкцию: remainingSeconds.
    remainingSeconds: "~{seconds} sec left",
    // Обрабатываем конструкцию: remainingMinutes.
    remainingMinutes: "~{minutes} min left",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: settingsFile.
  settingsFile: {
    // Обрабатываем конструкцию: root.
    root: "settings",
    // Обрабатываем конструкцию: invalidValue.
    invalidValue: "invalid value",
    // Обрабатываем конструкцию: noObject.
    noObject: "The file does not contain a settings object",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: log.
  log: {
    // Обрабатываем конструкцию: folderPickerTitle.
    folderPickerTitle: "Choose the strategies folder",
    // Обрабатываем конструкцию: folderPicked.
    folderPicked: "Strategies folder: {path}",
    // Обрабатываем конструкцию: folderPickFailed.
    folderPickFailed: "Could not choose the folder: {error}",
    // Обрабатываем конструкцию: processExited.
    processExited: "The process stopped unexpectedly",
    // Обрабатываем конструкцию: scanFailed.
    scanFailed: "Scan failed: {error}",
    // Обрабатываем конструкцию: scanTimeout.
    scanTimeout: "The game scan did not finish in time",
    // Обрабатываем конструкцию: injectFailed.
    injectFailed: "{name}: injection failed — {error}",
    // Обрабатываем конструкцию: injectDone.
    injectDone:
      // Обрабатываем конструкцию: Injection complete: {names} — {domains} domains and {ip….
      "Injection complete: {names} — {domains} domains and {ips} IPs total",
    // Обрабатываем конструкцию: restoreFailed.
    restoreFailed: "Could not remove sections — {error}",
    // Обрабатываем конструкцию: backupsFailed.
    backupsFailed: "Could not load the backup list: {error}",
    // Обрабатываем конструкцию: noNewEntries.
    noNewEntries: "{name}: no new entries (duplicates skipped: {count})",
    // Обрабатываем конструкцию: entriesAdded.
    entriesAdded: "{name}: {domains} domains, {ips} IPs in {files} configs",
    // Обрабатываем конструкцию: entriesRejected.
    entriesRejected: "{name}: rejected invalid entries — {count}",
    // Обрабатываем конструкцию: nativeFallback.
    nativeFallback:
      // Обрабатываем конструкцию: Strategy config was not parsed — running legacy .bat th….
      "Strategy config was not parsed — running legacy .bat through cmd.exe",
    // Обрабатываем конструкцию: injectGamesFailed.
    injectGamesFailed: "Game domain injection failed",
    // Обрабатываем конструкцию: stoppingVpn.
    stoppingVpn: "Stopping VPN before starting the strategy",
    // Обрабатываем конструкцию: gameProfileApplying.
    gameProfileApplying:
      // Обрабатываем конструкцию: Restarting the bypass with the launched games settings.
      "Restarting the bypass with the launched game's settings",
    // Обрабатываем конструкцию: strategyStarted.
    strategyStarted: "Strategy started, PID {pid}",
    // Обрабатываем конструкцию: launchCancelled.
    launchCancelled: "Launch cancelled: access not granted",
    // Обрабатываем конструкцию: launchFailed.
    launchFailed: "Could not start: {error}",
    // Обрабатываем конструкцию: strategyStopped.
    strategyStopped: "Strategy stopped, winws.exe processes: {count}",
    // Обрабатываем конструкцию: stopFailed.
    stopFailed: "Could not stop: {error}",
    // Обрабатываем конструкцию: trayUpdateFailed.
    trayUpdateFailed: "Tray not updated: {error}",
    // Обрабатываем конструкцию: trayNoLast.
    trayNoLast: "From tray: no last strategy selected",
    // Обрабатываем конструкцию: trayStrategyMissing.
    trayStrategyMissing:
      // Обрабатываем конструкцию: From tray: the strategy from settings no longer exists.
      "From tray: the strategy from settings no longer exists",
    // Обрабатываем конструкцию: trayNoActive.
    trayNoActive: "From tray: no active strategy",
    // Обрабатываем конструкцию: trayStopped.
    trayStopped: "Stopped from tray, winws.exe processes: {count}",
    // Обрабатываем конструкцию: trayStopFailed.
    trayStopFailed: "Could not stop from tray: {error}",
    // Обрабатываем конструкцию: trayStarted.
    trayStarted: "Started from tray, PID {pid}",
    // Обрабатываем конструкцию: trayStartFailed.
    trayStartFailed: "Could not start from tray: {error}",
    // Обрабатываем конструкцию: gameLaunched.
    gameLaunched: "Game launched: {name}, PID {pid}",
    // Обрабатываем конструкцию: gameLaunchFailed.
    gameLaunchFailed: "Could not launch {name}: {error}",
    // Обрабатываем конструкцию: gameScanFound.
    gameScanFound: "Found games: {count}",
    // Обрабатываем конструкцию: notifyTitle.
    notifyTitle: "Notification: {title}",
    // Обрабатываем конструкцию: notifyFailed.
    notifyFailed: "Notification not sent: {error}",
    // Обрабатываем конструкцию: updateAvailable.
    updateAvailable: "Strategy update available: {from} → {to}",
    // Обрабатываем конструкцию: updateUpToDate.
    updateUpToDate: "No updates, installed version {version}",
    // Обрабатываем конструкцию: updateCheckFailed.
    updateCheckFailed: "Update check failed: {error}",
    // Обрабатываем конструкцию: updateDownloaded.
    updateDownloaded: "Update archive downloaded: {name}",
    // Обрабатываем конструкцию: updateDownloadFailed.
    updateDownloadFailed: "Download failed: {error}",
    // Обрабатываем конструкцию: updateInstalled.
    updateInstalled: "Update installed: {version}, {count} files",
    // Обрабатываем конструкцию: updatePreserved.
    updatePreserved: ", your entries preserved: {count}",
    // Обрабатываем конструкцию: updateZapretOff.
    updateZapretOff: ". The stock zapret update check is disabled",
    // Обрабатываем конструкцию: updateInstallFailed.
    updateInstallFailed: "Installation failed: {error}",
    // Обрабатываем конструкцию: updateCancelFailed.
    updateCancelFailed: "Could not cancel the download: {error}",
    // Обрабатываем конструкцию: rollbackDone.
    rollbackDone: "Previous strategy version restored",
    // Обрабатываем конструкцию: rollbackFailed.
    rollbackFailed: "Rollback failed: {error}",
    // Обрабатываем конструкцию: versionMarked.
    versionMarked: "Strategy version marked as {version}",
    // Обрабатываем конструкцию: versionMarkFailed.
    versionMarkFailed: "Could not mark the version: {error}",
    // Обрабатываем конструкцию: versionIgnored.
    versionIgnored: "Version {version} added to the ignore list",
    // Обрабатываем конструкцию: dpiRestored.
    dpiRestored: "DPI strategy restored, PID {pid}",
    // Обрабатываем конструкцию: dpiRestoreFailed.
    dpiRestoreFailed: "Could not restore the DPI strategy: {error}",
    // Обрабатываем конструкцию: configDeleted.
    configDeleted: "Config deleted: {id}",
    // Обрабатываем конструкцию: configImported.
    configImported: "Config imported: {name}",
    // Обрабатываем конструкцию: vpnConnected.
    vpnConnected: "VPN connected: {name}",
    // Обрабатываем конструкцию: vpnConnectFailed.
    vpnConnectFailed: "Connection failed: {error}",
    // Обрабатываем конструкцию: chooseConfig.
    chooseConfig: "Choose a config first",
    // Обрабатываем конструкцию: vpnDisconnected.
    vpnDisconnected: "VPN disconnected",
    // Обрабатываем конструкцию: vpnDisconnectedError.
    vpnDisconnectedError: "VPN disconnected with an error",
    // Обрабатываем конструкцию: switchingToDpi.
    switchingToDpi: "Switching to DPI bypass",
    // Обрабатываем конструкцию: serversLoaded.
    serversLoaded: "Servers loaded: {count}",
    // Обрабатываем конструкцию: linkFailed.
    linkFailed: "Link not processed: {error}",
    // Обрабатываем конструкцию: coreInstalled.
    coreInstalled: "Xray core installed",
    // Обрабатываем конструкцию: coreNotInstalled.
    coreNotInstalled: "Core not installed: {error}",
    // Обрабатываем конструкцию: coreMissingInstalling.
    coreMissingInstalling: "Xray core not found, installing…",
    // Обрабатываем конструкцию: strategyStoppedTitle.
    strategyStoppedTitle: "Strategy stopped",
    // Обрабатываем конструкцию: strategyStoppedBody.
    strategyStoppedBody: "{name} is no longer running",
    // Обрабатываем конструкцию: strategyStartedTitle.
    strategyStartedTitle: "Strategy started",
    // Обрабатываем конструкцию: strategyStartedBody.
    strategyStartedBody: "{name} is running",
    // Обрабатываем конструкцию: launchErrorTitle.
    launchErrorTitle: "Launch error",
    // Обрабатываем конструкцию: vpnConnectedTitle.
    vpnConnectedTitle: "VPN connected",
    // Обрабатываем конструкцию: vpnConnectedBody.
    vpnConnectedBody: "Traffic goes through the tunnel",
    // Обрабатываем конструкцию: vpnErrorTitle.
    vpnErrorTitle: "VPN error",
    // Обрабатываем конструкцию: vpnErrorBody.
    vpnErrorBody: "See the event log for details",
    // Обрабатываем конструкцию: vpnDisconnectedTitle.
    vpnDisconnectedTitle: "VPN disconnected",
    // Обрабатываем конструкцию: vpnDisconnectedBody.
    vpnDisconnectedBody: "Back to normal mode",
    // Обрабатываем конструкцию: updateAvailableTitle.
    updateAvailableTitle: "Update available",
    // Обрабатываем конструкцию: updateAvailableBody.
    updateAvailableBody: "Strategies can be updated to {version}",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: settings.
  settings: {
    // Обрабатываем конструкцию: title.
    title: "Settings",
    // Обрабатываем конструкцию: subtitle.
    subtitle: "App behaviour and integrations",
    // Обрабатываем конструкцию: sections.
    sections: {
      // Обрабатываем конструкцию: vpn.
      vpn: "VPN",
      // Обрабатываем конструкцию: general.
      general: "General",
      // Обрабатываем конструкцию: appearance.
      appearance: "Appearance",
      // Обрабатываем конструкцию: strategies.
      strategies: "Strategies",
      // Обрабатываем конструкцию: updates.
      updates: "Updates",
      // Обрабатываем конструкцию: advanced.
      advanced: "Advanced",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: common.
    common: {
      // Обрабатываем конструкцию: resetSection.
      resetSection: "Reset section",
      // Обрабатываем конструкцию: cancel.
      cancel: "Cancel",
      // Обрабатываем конструкцию: confirm.
      confirm: "Confirm",
      // Обрабатываем конструкцию: saved.
      saved: "Saved",
      // Обрабатываем конструкцию: saving.
      saving: "Saving…",
      // Обрабатываем конструкцию: saveFailed.
      saveFailed: "Not saved",
      // Обрабатываем конструкцию: export.
      export: "Export settings",
      // Обрабатываем конструкцию: import.
      import: "Import settings",
      // Обрабатываем конструкцию: openFolder.
      openFolder: "Open folder",
      // Обрабатываем конструкцию: soon.
      soon: "Soon",
      // Обрабатываем конструкцию: verifyFailed.
      verifyFailed: "Check failed: {error}",
      // Обрабатываем конструкцию: resetDone.
      resetDone: "All settings reset to defaults",
      // Обрабатываем конструкцию: resetFailed.
      resetFailed: "Reset could not be saved to the settings file",
      // Обрабатываем конструкцию: logsRemoved.
      logsRemoved: "Removed log files: {count}",
      // Обрабатываем конструкцию: logsRemoveFailed.
      logsRemoveFailed: "Logs could not be removed: {error}",
      // Обрабатываем конструкцию: logsCleared.
      logsCleared: "Log journal cleared",
      // Обрабатываем конструкцию: backupsRemoved.
      backupsRemoved: "Backups removed: {count}",
      // Обрабатываем конструкцию: backupsRemoveFailed.
      backupsRemoveFailed: "Backups not removed: {error}",
      // Обрабатываем конструкцию: deleteConfirmPlaceholder.
      deleteConfirmPlaceholder: "Type DELETE to confirm",
      // Обрабатываем конструкцию: itemAria.
      itemAria: "Item {index} of {total}",
      // Обрабатываем конструкцию: deleteItemAria.
      deleteItemAria: "Remove item {index}",
      // Обрабатываем конструкцию: deleteItemTitle.
      deleteItemTitle: "Remove",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: general.
    general: {
      // Обрабатываем конструкцию: enableLogs.
      enableLogs: "Keep logs",
      // Обрабатываем конструкцию: enableLogsHint.
      enableLogsHint:
        // Обрабатываем конструкцию: Event journal, the Logs section and the recent events b….
        "Event journal, the Logs section and the recent events block",
      // Обрабатываем конструкцию: toastsDisabledHint.
      toastsDisabledHint:
        // Обрабатываем конструкцию: Windows system notifications are disabled — enable them….
        "Windows system notifications are disabled — enable them in Settings → System → Notifications. In-app notifications keep working regardless.",
      // Обрабатываем конструкцию: title.
      title: "General",
      // Обрабатываем конструкцию: description.
      description: "Language, autostart, window behaviour and notifications",
      // Обрабатываем конструкцию: language.
      language: "Interface language",
      // Обрабатываем конструкцию: languageHint.
      languageHint: "Full RU and EN localization",
      // Обрабатываем конструкцию: languageRu.
      languageRu: "Русский",
      // Обрабатываем конструкцию: languageEn.
      languageEn: "English",
      // Обрабатываем конструкцию: autoStart.
      autoStart: "Run at Windows startup",
      // Обрабатываем конструкцию: autoStartHint.
      autoStartHint:
        // Обрабатываем конструкцию: Writes to HKCU\\Software\\Microsoft\\Windows\\CurrentVe….
        "Writes to HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      // Обрабатываем конструкцию: autoStartOn.
      autoStartOn: "Run at Windows startup enabled",
      // Обрабатываем конструкцию: autoStartOff.
      autoStartOff: "Run at Windows startup disabled",
      // Обрабатываем конструкцию: autoStartFailed.
      autoStartFailed: "Could not change autostart: {error}",
      // Обрабатываем конструкцию: minimizeToTray.
      minimizeToTray: "Minimize to tray on close",
      // Обрабатываем конструкцию: startMinimized.
      startMinimized: "Start minimized",
      // Обрабатываем конструкцию: showNotifications.
      showNotifications: "Show notifications",
      // Обрабатываем конструкцию: notifyOnStart.
      notifyOnStart: "Strategy start notification",
      // Обрабатываем конструкцию: notifyOnStartHint.
      notifyOnStartHint:
        // Обрабатываем конструкцию: System notification when a strategy is started from tra….
        "System notification when a strategy is started from tray or window",
      // Обрабатываем конструкцию: notifyOnStop.
      notifyOnStop: "Strategy stop notification",
      // Обрабатываем конструкцию: notifyOnStopHint.
      notifyOnStopHint: "System notification after a strategy stops",
      // Обрабатываем конструкцию: notifyOnUpdate.
      notifyOnUpdate: "Update notifications",
      // Обрабатываем конструкцию: notifyOnUpdateHint.
      notifyOnUpdateHint: "Notify when strategies can be updated",
      // Обрабатываем конструкцию: showNotificationsHint.
      showNotificationsHint:
        // Обрабатываем конструкцию: Master toggle: disables start, stop and update notifica….
        "Master toggle: disables start, stop and update notifications",
      // Обрабатываем конструкцию: showIn.
      showIn: "Where notifications appear",
      // Обрабатываем конструкцию: showInHint.
      showInHint:
        // Обрабатываем конструкцию: In the app — in-window toasts and sounds; in Windows — ….
        "In the app — in-window toasts and sounds; in Windows — native Windows notifications",
      // Обрабатываем конструкцию: showInApp.
      showInApp: "In the app",
      // Обрабатываем конструкцию: showInWindows.
      showInWindows: "In Windows",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: vpnPanel.
    vpnPanel: {
      // Обрабатываем конструкцию: title.
      title: "VPN",
      // Обрабатываем конструкцию: description.
      description: "Connection and traffic protection options",
      // Обрабатываем конструкцию: handshake.
      handshake: "Connection check",
      // Обрабатываем конструкцию: handshakeHint.
      handshakeHint: "Seconds to wait for confirmation after connecting",
      // Обрабатываем конструкцию: autoConnectOnStart.
      autoConnectOnStart: "Connect on launch",
      // Обрабатываем конструкцию: autoConnectOnStartHint.
      autoConnectOnStartHint: "Restore the VPN tunnel when the app starts",
      // Обрабатываем конструкцию: killSwitch.
      killSwitch: "Kill traffic on drop",
      // Обрабатываем конструкцию: killSwitchHint.
      killSwitchHint: "Block the internet if the VPN tunnel is unavailable",
      // Обрабатываем конструкцию: keepAlive.
      keepAlive: "Keep the connection alive",
      // Обрабатываем конструкцию: keepAliveHint.
      keepAliveHint: "Keep the tunnel running even when idle",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: appearance.
    appearance: {
      // Обрабатываем конструкцию: title.
      title: "Appearance",
      // Обрабатываем конструкцию: description.
      description: "Theme, interface scale and animations",
      // Обрабатываем конструкцию: theme.
      theme: "Theme",
      // Обрабатываем конструкцию: density.
      density: "Interface density",
      // Обрабатываем конструкцию: interfaceScale.
      interfaceScale: "Interface scale",
      // Обрабатываем конструкцию: interfaceScaleHint.
      interfaceScaleHint: "Tune the size for your screen",
      // Обрабатываем конструкцию: animationSpeed.
      animationSpeed: "Animation speed",
      // Обрабатываем конструкцию: animationSpeedHint.
      animationSpeedHint: "Smoothness of transitions, entrances and pulses",
      // Обрабатываем конструкцию: animations.
      animations: "Animations",
      // Обрабатываем конструкцию: animationsHint.
      animationsHint: "Disables transitions and card dealing",
      // Обрабатываем конструкцию: trayIcon.
      trayIcon: "Animate tray icon",
      // Обрабатываем конструкцию: values.
      values: {
        // Обрабатываем конструкцию: dark.
        dark: "Dark",
        // Обрабатываем конструкцию: light.
        light: "Light",
        // Обрабатываем конструкцию: auto.
        auto: "System",
        // Обрабатываем конструкцию: compact.
        compact: "Compact",
        // Обрабатываем конструкцию: normal.
        normal: "Normal",
        // Обрабатываем конструкцию: comfy.
        comfy: "Comfy",
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: strategies.
    strategies: {
      // Обрабатываем конструкцию: title.
      title: "Strategies",
      // Обрабатываем конструкцию: description.
      description: "Strategies folder and launch parameters",
      // Обрабатываем конструкцию: folder.
      folder: "Strategies folder",
      // Обрабатываем конструкцию: choose.
      choose: "Choose folder",
      // Обрабатываем конструкцию: rescan.
      rescan: "Rescan now",
      // Обрабатываем конструкцию: rescanning.
      rescanning: "Rescanning strategies…",
      // Обрабатываем конструкцию: found.
      found: "Strategies found",
      // Обрабатываем конструкцию: foundLog.
      foundLog: "Strategies found: {count}",
      // Обрабатываем конструкцию: startTimeout.
      startTimeout: "Start timeout, sec",
      // Обрабатываем конструкцию: stopTimeout.
      stopTimeout: "Stop timeout, sec",
      // Обрабатываем конструкцию: resetRatings.
      resetRatings: "Reset measurements",
      // Обрабатываем конструкцию: resetRatingsHint.
      resetRatingsHint:
        // Обрабатываем конструкцию: Deletes saved strategy rating scores. New measurements ….
        "Deletes saved strategy rating scores. New measurements arrive after future runs.",
      // Обрабатываем конструкцию: resetRatingsArmed.
      resetRatingsArmed: "Click again to reset",
      // Обрабатываем конструкцию: resetRatingsDone.
      resetRatingsDone: "Rating measurements reset",
      // Обрабатываем конструкцию: resetRatingsFailed.
      resetRatingsFailed: "Failed to reset measurements: {error}",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: vpn.
    vpn: {
      // Обрабатываем конструкцию: enabled.
      enabled: "VPN enabled",
      // Обрабатываем конструкцию: enabledHint.
      enabledHint: "Master switch for connecting on the dashboard",
      // Обрабатываем конструкцию: title.
      title: "VPN",
      // Обрабатываем конструкцию: description.
      description:
        // Обрабатываем конструкцию: Connection through the Xray core: servers come from the….
        "Connection through the Xray core: servers come from the subscription, the tunnel is raised on the fastest node",
      // Обрабатываем конструкцию: autoConnect.
      autoConnect: "Auto-connect on start",
      // Обрабатываем конструкцию: autoConnectHint.
      autoConnectHint: "5 seconds after the app opens",
      // Обрабатываем конструкцию: killSwitch.
      killSwitch: "Kill Switch",
      // Обрабатываем конструкцию: killSwitchHint.
      killSwitchHint:
        // Обрабатываем конструкцию: Blocks traffic while VPN is disconnected. Requires admi….
        "Blocks traffic while VPN is disconnected. Requires administrator rights",
      // Обрабатываем конструкцию: killSwitchTitle.
      killSwitchTitle: "Enable Kill Switch?",
      // Обрабатываем конструкцию: killSwitchNeedsAdmin.
      killSwitchNeedsAdmin: "Administrator rights required",
      // Обрабатываем конструкцию: killSwitchEnable.
      killSwitchEnable: "Enable",
      // Обрабатываем конструкцию: killSwitchBody.
      killSwitchBody:
        // Обрабатываем конструкцию: Kill Switch blocks all internet traffic while VPN is di….
        "Kill Switch blocks all internet traffic while VPN is disconnected. This protects against real IP leaks, but if VPN fails you will be left without internet. Local network and tunnel traffic remain allowed.",
      // Обрабатываем конструкцию: handshakeTimeout.
      handshakeTimeout: "Handshake timeout, sec",
      // Обрабатываем конструкцию: handshakeTimeoutHint.
      handshakeTimeoutHint: "How long to wait for the VPN server response",
      // Обрабатываем конструкцию: configsTitle.
      configsTitle: "WireGuard configs",
      // Обрабатываем конструкцию: importConfig.
      importConfig: "Import config (.conf)",
      // Обрабатываем конструкцию: deleteConfigTitle.
      deleteConfigTitle: "Delete config?",
      // Обрабатываем конструкцию: deleteConfigHint.
      deleteConfigHint:
        // Обрабатываем конструкцию: The file will be removed from the app folder. This cann….
        "The file will be removed from the app folder. This cannot be undone.",
      // Обрабатываем конструкцию: deleteConfigBody.
      deleteConfigBody: "Config: {name}",
      // Обрабатываем конструкцию: importFailed.
      importFailed: "Failed to import config",
      // Обрабатываем конструкцию: noConfigs.
      noConfigs: "No configs yet",
      // Обрабатываем конструкцию: noConfigsHint.
      noConfigsHint: "Import a WireGuard or AmneziaWG .conf file",
      // Обрабатываем конструкцию: setActive.
      setActive: "Set active",
      // Обрабатываем конструкцию: active.
      active: "Active",
      // Обрабатываем конструкцию: delete.
      delete: "Delete",
      // Обрабатываем конструкцию: connected.
      connected: "Connected",
      // Обрабатываем конструкцию: connecting.
      connecting: "Connecting…",
      // Обрабатываем конструкцию: disconnected.
      disconnected: "Disconnected",
      // Обрабатываем конструкцию: disconnecting.
      disconnecting: "Disconnecting…",
      // Обрабатываем конструкцию: error.
      error: "Error",
      // Обрабатываем конструкцию: disconnect.
      disconnect: "Disconnect",
      // Обрабатываем конструкцию: stepStoppingDpi.
      stepStoppingDpi: "Stopping DPI bypass…",
      // Обрабатываем конструкцию: stepStartingVpn.
      stepStartingVpn: "Starting VPN tunnel…",
      // Обрабатываем конструкцию: stepCheckingHandshake.
      stepCheckingHandshake: "Checking handshake…",
      // Обрабатываем конструкцию: stepStoppingVpn.
      stepStoppingVpn: "Stopping VPN…",
      // Обрабатываем конструкцию: stepDone.
      stepDone: "Done",
      // Обрабатываем конструкцию: switching.
      switching: "Switching…",
      // Обрабатываем конструкцию: toggleVpnActive.
      toggleVpnActive: "VPN is active, traffic goes through the tunnel",
      // Обрабатываем конструкцию: toggleDpiActive.
      toggleDpiActive: "DPI bypass is active",
      // Обрабатываем конструкцию: toggleAriaLabel.
      toggleAriaLabel: "Bypass mode: DPI or VPN",
      // Обрабатываем конструкцию: handshakeNever.
      handshakeNever: "Never",
      // Обрабатываем конструкцию: secondsAgo.
      secondsAgo: "{value} sec ago",
      // Обрабатываем конструкцию: minutesAgo.
      minutesAgo: "{value} min ago",
      // Обрабатываем конструкцию: hoursAgo.
      hoursAgo: "{value} h ago",
      // Обрабатываем конструкцию: switchToDpi.
      switchToDpi: "Back to DPI bypass",
      // Обрабатываем конструкцию: bytesIn.
      bytesIn: "Received",
      // Обрабатываем конструкцию: bytesOut.
      bytesOut: "Sent",
      // Обрабатываем конструкцию: uptime.
      uptime: "Uptime",
      // Обрабатываем конструкцию: handshake.
      handshake: "Handshake",
      // Обрабатываем конструкцию: endpoint.
      endpoint: "Server",
      // Обрабатываем конструкцию: notInstalled.
      notInstalled: "WireGuard not found",
      // Обрабатываем конструкцию: notInstalledHint.
      notInstalledHint:
        // Обрабатываем конструкцию: Install WireGuard or AmneziaWG and press “Check again”.
        "Install WireGuard or AmneziaWG and press “Check again”",
      // Обрабатываем конструкцию: recheck.
      recheck: "Check again",
      // Обрабатываем конструкцию: openInstaller.
      openInstaller: "Open WireGuard website",
      // Обрабатываем конструкцию: noActiveConfig.
      noActiveConfig: "Choose a config first",
      // Обрабатываем конструкцию: noticeInstallFirst.
      noticeInstallFirst: "Install WireGuard in Settings → VPN first",
      // Обрабатываем конструкцию: quickActions.
      quickActions: "Quick actions",
      // Обрабатываем конструкцию: noStrategies.
      noStrategies: "No strategies",
      // Обрабатываем конструкцию: chooseStrategy.
      chooseStrategy: "Pick strategy: {name}",
      // Обрабатываем конструкцию: stopBypass.
      stopBypass: "Stop bypass",
      // Обрабатываем конструкцию: badgeVpn.
      badgeVpn: "VPN",
      // Обрабатываем конструкцию: badgeDpi.
      badgeDpi: "DPI",
      // Обрабатываем конструкцию: badgeOff.
      badgeOff: "OFF",
      // Обрабатываем конструкцию: badgeAriaLabel.
      badgeAriaLabel: "Current bypass mode: {mode}",
      // Обрабатываем конструкцию: heroVpn.
      heroVpn: "VPN tunnel is active",
      // Обрабатываем конструкцию: disconnectVpn.
      disconnectVpn: "Disconnect VPN",
      // Обрабатываем конструкцию: disconnectBypass.
      disconnectBypass: "Disconnect bypass",
      // Обрабатываем конструкцию: connectBypass.
      connectBypass: "Connect bypass",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: games.
    games: {
      // Обрабатываем конструкцию: title.
      title: "Games",
      // Обрабатываем конструкцию: description.
      description:
        // Обрабатываем конструкцию: Game domains are added to strategy configs before launc….
        "Game domains are added to strategy configs before launch and removed on stop",
      // Обрабатываем конструкцию: empty.
      empty: "Game list is empty",
      // Обрабатываем конструкцию: add.
      add: "Add game",
      // Обрабатываем конструкцию: reset.
      reset: "Reset game list",
      // Обрабатываем конструкцию: enableFor.
      enableFor: "Injection for {name}",
      // Обрабатываем конструкцию: deleteNamed.
      deleteNamed: "Delete game {name}",
      // Обрабатываем конструкцию: deleteTitle.
      deleteTitle: "Remove game from the list?",
      // Обрабатываем конструкцию: deleteBody.
      deleteBody:
        // Обрабатываем конструкцию: {name} will be removed from the list together with its ….
        "{name} will be removed from the list together with its domains and ports. Bring it back with “Reset game list”.",
      // Обрабатываем конструкцию: deleteConfirm.
      deleteConfirm: "Remove",
      // Обрабатываем конструкцию: toggleEditor.
      toggleEditor: "Show game settings",
      // Обрабатываем конструкцию: name.
      name: "Name",
      // Обрабатываем конструкцию: domains.
      domains: "Domains",
      // Обрабатываем конструкцию: addDomain.
      addDomain: "Add domain",
      // Обрабатываем конструкцию: noDomains.
      noDomains: "No domains",
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: "IP ranges",
      // Обрабатываем конструкцию: addIpRange.
      addIpRange: "Add range",
      // Обрабатываем конструкцию: noIpRanges.
      noIpRanges: "No ranges",
      // Обрабатываем конструкцию: ports.
      ports: "Ports",
      // Обрабатываем конструкцию: addPort.
      addPort: "Add port",
      // Обрабатываем конструкцию: noPorts.
      noPorts: "No ports",
      // Обрабатываем конструкцию: createBackup.
      createBackup: "Create backup before changes",
      // Обрабатываем конструкцию: autoRestore.
      autoRestore: "Remove sections after stop",
      // Обрабатываем конструкцию: import.
      import: "Import",
      // Обрабатываем конструкцию: export.
      export: "Export",
      // Обрабатываем конструкцию: fileDialog.
      fileDialog: "Game",
      // Обрабатываем конструкцию: exported.
      exported: "Game exported: {name}",
      // Обрабатываем конструкцию: exportFailed.
      exportFailed: "Could not export game: {error}",
      // Обрабатываем конструкцию: importInvalid.
      importInvalid: "File does not look like a game description",
      // Обрабатываем конструкцию: imported.
      imported: "List loaded into game {name}",
      // Обрабатываем конструкцию: importFailed.
      importFailed: "Could not load game: {error}",
      // Обрабатываем конструкцию: domainsCount.
      domainsCount: "{count} domain",
      // Обрабатываем конструкцию: domainsCountFew.
      domainsCountFew: "{count} domains",
      // Обрабатываем конструкцию: domainsCountMany.
      domainsCountMany: "{count} domains",
      // Обрабатываем конструкцию: portsCount.
      portsCount: "{count} port",
      // Обрабатываем конструкцию: portsCountFew.
      portsCountFew: "{count} ports",
      // Обрабатываем конструкцию: portsCountMany.
      portsCountMany: "{count} ports",
      // Обрабатываем конструкцию: installed.
      installed: {
        // Обрабатываем конструкцию: count.
        count: "Found games: {count}",
        // Обрабатываем конструкцию: empty.
        empty: {
          // Обрабатываем конструкцию: title.
          title: "No games found",
          // Обрабатываем конструкцию: body.
          body: "The app looks for games on its own. If your game is missing, add it manually or point the app at a games folder.",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: scan.
        scan: {
          // Обрабатываем конструкцию: covers.
          covers: "Covers {current} of {total}",
          // Обрабатываем конструкцию: searching.
          searching: "Looking for installed games…",
          // Обрабатываем конструкцию: source.
          source: "Checking: {source}",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: badge.
        badge: {
          // Обрабатываем конструкцию: steam.
          steam: "Steam",
          // Обрабатываем конструкцию: epic.
          epic: "Epic",
          // Обрабатываем конструкцию: gog.
          gog: "GOG",
          // Обрабатываем конструкцию: ubisoft.
          ubisoft: "Ubisoft",
          // Обрабатываем конструкцию: riot.
          riot: "Riot",
          // Обрабатываем конструкцию: ea.
          ea: "EA",
          // Обрабатываем конструкцию: battlenet.
          battlenet: "Battle.net",
          // Обрабатываем конструкцию: custom.
          custom: "Manual",
          // Обрабатываем конструкцию: bypassOn.
          bypassOn: "Bypass on",
          // Обрабатываем конструкцию: bypassOff.
          bypassOff: "No bypass",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: bypassSettings.
        bypassSettings: "Bypass settings: domains and IPs",
        // Обрабатываем конструкцию: source.
        source: {
          // Обрабатываем конструкцию: registry.
          registry: "installed programs",
          // Обрабатываем конструкцию: steam.
          steam: "Steam",
          // Обрабатываем конструкцию: epic.
          epic: "Epic Games",
          // Обрабатываем конструкцию: gog.
          gog: "GOG",
          // Обрабатываем конструкцию: ubisoft.
          ubisoft: "Ubisoft",
          // Обрабатываем конструкцию: riot.
          riot: "Riot",
          // Обрабатываем конструкцию: ea.
          ea: "EA and Battle.net",
          // Обрабатываем конструкцию: battlenet.
          battlenet: "Battle.net",
          // Обрабатываем конструкцию: knownFolder.
          knownFolder: "game folders",
          // Обрабатываем конструкцию: battleNet.
          battleNet: "Battle.net",
          // Обрабатываем конструкцию: userFolder.
          userFolder: "your folders",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: launch.
        launch: {
          // Обрабатываем конструкцию: action.
          action: "Launch game",
          // Обрабатываем конструкцию: starting.
          starting: "Launching {name}…",
          // Обрабатываем конструкцию: active.
          active: "Bypass is active, launching the game",
          // Обрабатываем конструкцию: activePlain.
          activePlain: "Launching the game without bypass",
          // Обрабатываем конструкцию: failed.
          failed: "Could not launch the game",
          // Обрабатываем конструкцию: bypassLost.
          bypassLost: "Bypass stopped working after launching {name}",
          // Обрабатываем конструкцию: strategyStarting.
          strategyStarting: "Starting the bypass strategy…",
          // Обрабатываем конструкцию: bypassAutoOn.
          bypassAutoOn: "Enabling bypass for {name}",
          // Обрабатываем конструкцию: strategyFailed.
          strategyFailed: "The strategy did not start: {error}",
          // Обрабатываем конструкцию: strategyNotRunning.
          strategyNotRunning: "bypass process was not found",
          // Обрабатываем конструкцию: tuningFailed.
          tuningFailed: "Could not tune parameters for this game: {error}",
          // Обрабатываем конструкцию: count.
          count: "Launches: {count}",
          // Обрабатываем конструкцию: bypassFailedTitle.
          bypassFailedTitle: "The bypass did not work",
          // Обрабатываем конструкцию: bypassFailedBody.
          bypassFailedBody:
            // Обрабатываем конструкцию: The DPI bypass could not break through the game protect….
            "The DPI bypass could not break through the game protection. We recommend using the built-in VPN for a stable connection.",
          // Обрабатываем конструкцию: bypassFailedRetry.
          bypassFailedRetry: "Try again",
          // Обрабатываем конструкцию: bypassFailedUseVpn.
          bypassFailedUseVpn: "Enable VPN",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: anticheat.
        anticheat: {
          // Обрабатываем конструкцию: battleye.
          battleye: "BattlEye",
          // Обрабатываем конструкцию: eac.
          eac: "Easy Anti-Cheat",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: diagnose.
        diagnose: {
          // Обрабатываем конструкцию: action.
          action: "Diagnostics",
          // Обрабатываем конструкцию: title.
          title: "Diagnostics: {name}",
          // Обрабатываем конструкцию: subtitle.
          subtitle:
            // Обрабатываем конструкцию: We check step by step: from the bypass to the traffic t….
            "We check step by step: from the bypass to the traffic to the match server",
          // Обрабатываем конструкцию: loading.
          loading: "Reading logs…",
          // Обрабатываем конструкцию: applied.
          applied: "What the app already applied",
          // Обрабатываем конструкцию: logs.
          logs: "Open logs folder",
          // Обрабатываем конструкцию: endpoints.
          endpoints: "Game service check (real TLS)",
          // Обрабатываем конструкцию: recheck.
          recheck: "Check again",
          // Обрабатываем конструкцию: checking.
          checking: "Checking…",
          // Обрабатываем конструкцию: checkFailed.
          checkFailed: "Check did not run.",
          // Обрабатываем конструкцию: reachable.
          reachable: "Reachable",
          // Обрабатываем конструкцию: blocked.
          blocked: "Unreachable",
          // Обрабатываем конструкцию: traffic.
          traffic: "Game server",
          // Обрабатываем конструкцию: checkTraffic.
          checkTraffic: "Check traffic",
          // Обрабатываем конструкцию: noServer.
          noServer: "No match server in the game log — start a session.",
          // Обрабатываем конструкцию: trafficCounts.
          trafficCounts: "Sent {out}, received {in}, dropped {drop}.",
          // Обрабатываем конструкцию: connectivity.
          connectivity: "Game server reachability",
          // Обрабатываем конструкцию: connectivityDnsOk.
          connectivityDnsOk: "Domain resolves: {address}",
          // Обрабатываем конструкцию: connectivityDnsFailed.
          connectivityDnsFailed: "Domain does not resolve: {error}",
          // Обрабатываем конструкцию: connectivityUdp.
          connectivityUdp:
            // Обрабатываем конструкцию: UDP does not answer a test packet: blocked and open loo….
            "UDP does not answer a test packet: blocked and open look the same — this is not a check.",
          // Обрабатываем конструкцию: details.
          details: "Check details",
          // Обрабатываем конструкцию: stepBypass.
          stepBypass: "Bypass is running",
          // Обрабатываем конструкцию: stepBypassOk.
          stepBypassOk: "The strategy runs and traffic goes through it.",
          // Обрабатываем конструкцию: stepBypassFail.
          stepBypassFail: "No strategy is running — the game cannot connect.",
          // Обрабатываем конструкцию: stepDns.
          stepDns: "Game server domains",
          // Обрабатываем конструкцию: stepDnsOk.
          stepDnsOk: "The domain resolves: {address}",
          // Обрабатываем конструкцию: stepDnsFail.
          stepDnsFail: "The domain does not resolve: {error}",
          // Обрабатываем конструкцию: stepServers.
          stepServers: "Connection to game servers",
          // Обрабатываем конструкцию: stepServersOk.
          stepServersOk: "TCP to the game servers gets through.",
          // Обрабатываем конструкцию: stepServersFail.
          stepServersFail:
            // Обрабатываем конструкцию: {count} of {total} connections to game servers do not g….
            "{count} of {total} connections to game servers do not get through.",
          // Обрабатываем конструкцию: stepServices.
          stepServices: "Game services (TLS)",
          // Обрабатываем конструкцию: stepServicesOk.
          stepServicesOk: "All game services answer.",
          // Обрабатываем конструкцию: stepServicesFail.
          stepServicesFail: "{count} of {total} game services do not answer.",
          // Обрабатываем конструкцию: stepTraffic.
          stepTraffic: "Traffic to the match server",
          // Обрабатываем конструкцию: stepTrafficOk.
          stepTrafficOk: "Packets to the match server go through the bypass.",
          // Обрабатываем конструкцию: stepUnknown.
          stepUnknown: "Not checked.",
          // Обрабатываем конструкцию: actionRestart.
          actionRestart: "Restart the bypass",
          // Обрабатываем конструкцию: actionVpn.
          actionVpn: "Enable VPN",
          // Обрабатываем конструкцию: restarted.
          restarted: "The bypass was restarted with the game profile.",
          // Обрабатываем конструкцию: verdictOk.
          verdictOk: "All good",
          // Обрабатываем конструкцию: verdictProblem.
          verdictProblem: "Problems: {count}",
          // Обрабатываем конструкцию: recommendationOk.
          recommendationOk:
            // Обрабатываем конструкцию: The check passed: the bypass works and the game service….
            "The check passed: the bypass works and the game services are reachable.",
          // Обрабатываем конструкцию: recommendationRestart.
          recommendationRestart:
            // Обрабатываем конструкцию: Restart the bypass with the game profile first, then ch….
            "Restart the bypass with the game profile first, then check again.",
          // Обрабатываем конструкцию: recommendationVpn.
          recommendationVpn:
            // Обрабатываем конструкцию: The bypass cannot handle this game: enable the VPN from….
            "The bypass cannot handle this game: enable the VPN from your subscription.",
          // Обрабатываем конструкцию: connectivityVerdict.
          connectivityVerdict: {
            // Обрабатываем конструкцию: dns-failed.
            "dns-failed":
              // Обрабатываем конструкцию: Server domains do not resolve: the bypass will not be a….
              "Server domains do not resolve: the bypass will not be able to connect to anything.",
            // Обрабатываем конструкцию: tcp-ok.
            "tcp-ok":
              // Обрабатываем конструкцию: TCP reaches the servers. UDP cannot be checked — it doe….
              "TCP reaches the servers. UDP cannot be checked — it does not answer an empty packet; if the game still fails to connect, look at the log diagnostics.",
            // Обрабатываем конструкцию: tcp-failed.
            "tcp-failed":
              // Обрабатываем конструкцию: TCP does not reach the servers. The bypass is most like….
              "TCP does not reach the servers. The bypass is most likely not active: start a strategy and check again.",
            // Закрываем текущий блок.
          },
          // Обрабатываем конструкцию: verdict.
          verdict: {
            // Обрабатываем конструкцию: no-log.
            "no-log": "No bypass log",
            // Обрабатываем конструкцию: no-outbound.
            "no-outbound": "No requests to the server",
            // Обрабатываем конструкцию: no-inbound.
            "no-inbound": "No replies — connection breaks",
            // Обрабатываем конструкцию: tampered.
            tampered: "Bypass breaks the traffic",
            // Обрабатываем конструкцию: clean.
            clean: "Traffic is fine",
            // Закрываем текущий блок.
          },
          // Обрабатываем конструкцию: close.
          close: "Close",
          // Обрабатываем конструкцию: failed.
          failed: "Diagnostics failed: {error}",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: prompt.
        prompt: {
          // Обрабатываем конструкцию: anticheatBody.
          anticheatBody:
            // Обрабатываем конструкцию: {name} uses {anticheat}: without a working bypass, matc….
            "{name} uses {anticheat}: without a working bypass, matchmaking will most likely refuse to connect.",
          // Обрабатываем конструкцию: chooseTitle.
          chooseTitle: "How to launch the game?",
          // Обрабатываем конструкцию: chooseBody.
          chooseBody:
            // Обрабатываем конструкцию: First launch of {name}. With the bypass enabled or with….
            "First launch of {name}. With the bypass enabled or without it? The choice will be remembered for this game.",
          // Обрабатываем конструкцию: chooseBypass.
          chooseBypass: "With bypass",
          // Обрабатываем конструкцию: choosePlain.
          choosePlain: "Without bypass",
          // Обрабатываем конструкцию: failedTitle.
          failedTitle: "Last launch did not go well",
          // Обрабатываем конструкцию: failedBody.
          failedBody:
            // Обрабатываем конструкцию: {name} closed a few seconds after launching — the bypas….
            "{name} closed a few seconds after launching — the bypass may have failed. Connect VPN instead?",
          // Обрабатываем конструкцию: failedVpn.
          failedVpn: "Use VPN",
          // Обрабатываем конструкцию: bypassTitle.
          bypassTitle: "Bypass is off",
          // Обрабатываем конструкцию: bypassBody.
          bypassBody:
            // Обрабатываем конструкцию: Bypass is disabled for {name}. Turn it on and launch th….
            "Bypass is disabled for {name}. Turn it on and launch the game?",
          // Обрабатываем конструкцию: noStrategyTitle.
          noStrategyTitle: "No strategy",
          // Обрабатываем конструкцию: noStrategyBody.
          noStrategyBody:
            // Обрабатываем конструкцию: No bypass strategy is selected. Open the Strategies sec….
            "No bypass strategy is selected. Open the Strategies section, start any strategy, then launch the game again.",
          // Обрабатываем конструкцию: cancel.
          cancel: "Cancel",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: removeManual.
        removeManual: "Remove from list",
        // Обрабатываем конструкцию: removeGame.
        removeGame: "Remove game from list",
        // Обрабатываем конструкцию: removeTitle.
        removeTitle: "Remove game?",
        // Обрабатываем конструкцию: removeBody.
        removeBody:
          // Обрабатываем конструкцию: {name} will disappear from the Games page and will not ….
          "{name} will disappear from the Games page and will not come back on a rescan. The game itself stays on disk.",
        // Обрабатываем конструкцию: removeConfirm.
        removeConfirm: "Remove",
        // Обрабатываем конструкцию: closeGame.
        closeGame: "Close game",
        // Обрабатываем конструкцию: closedGame.
        closedGame: "Game closed: {name}",
        // Обрабатываем конструкцию: closeGameFailed.
        closeGameFailed: "Could not close the game: {error}",
        // Обрабатываем конструкцию: rescan.
        rescan: "Rescan",
        // Обрабатываем конструкцию: changeLaunchMode.
        changeLaunchMode: "Change launch mode",
        // Обрабатываем конструкцию: add.
        add: {
          // Обрабатываем конструкцию: action.
          action: "Add game",
          // Обрабатываем конструкцию: title.
          title: "Add a game manually",
          // Обрабатываем конструкцию: description.
          description:
            // Обрабатываем конструкцию: Enter the name and the path to the .exe — the app will ….
            "Enter the name and the path to the .exe — the app will launch the game and apply the bypass.",
          // Обрабатываем конструкцию: path.
          path: "Path to .exe",
          // Обрабатываем конструкцию: browse.
          browse: "Browse",
          // Обрабатываем конструкцию: platform.
          platform: "Platform",
          // Обрабатываем конструкцию: bypass.
          bypass: "Bypass settings",
          // Обрабатываем конструкцию: bypassNone.
          bypassNone: "No binding",
          // Обрабатываем конструкцию: submit.
          submit: "Add",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: folders.
        folders: {
          // Обрабатываем конструкцию: title.
          title: "Game folders",
          // Обрабатываем конструкцию: add.
          add: "Add folder",
          // Обрабатываем конструкцию: remove.
          remove: "Remove",
          // Обрабатываем конструкцию: empty.
          empty: "No custom folders",
          // Обрабатываем конструкцию: hint.
          hint: "These folders are scanned on every app start",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: cover.
        cover: {
          // Обрабатываем конструкцию: pick.
          pick: "Choose cover",
          // Обрабатываем конструкцию: pickFailed.
          pickFailed: "Could not load the cover: {error}",
          // Обрабатываем конструкцию: ready.
          ready: "Cover updated",
          // Закрываем текущий блок.
        },
        // Обрабатываем конструкцию: path.
        path: {
          // Обрабатываем конструкцию: title.
          title: "Game path",
          // Обрабатываем конструкцию: label.
          label: "Path to .exe",
          // Обрабатываем конструкцию: submit.
          submit: "Save",
          // Закрываем текущий блок.
        },
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: updates.
    updates: {
      // Обрабатываем конструкцию: title.
      title: "Strategy updates",
      // Обрабатываем конструкцию: description.
      description:
        // Обрабатываем конструкцию: Strategies are updated from GitHub Releases. Your list ….
        "Strategies are updated from GitHub Releases. Your list edits and Outlast Trials settings are preserved, a backup is created before replacement.",
      // Обрабатываем конструкцию: current.
      current: "Installed",
      // Обрабатываем конструкцию: autoCheck.
      autoCheck: "Check for updates on startup",
      // Обрабатываем конструкцию: autoCheckHint.
      autoCheckHint: "A few seconds after the app opens",
      // Обрабатываем конструкцию: checkNow.
      checkNow: "Check now",
      // Обрабатываем конструкцию: details.
      details: "Details",
      // Обрабатываем конструкцию: repo.
      repo: "GitHub repository",
      // Обрабатываем конструкцию: repoHint.
      repoHint: "The repository can be changed if the upstream is renamed",
      // Обрабатываем конструкцию: repoPlaceholder.
      repoPlaceholder: "owner/repository",
      // Обрабатываем конструкцию: repoInvalid.
      repoInvalid: "Expected owner/name, e.g. Flowseal/zapret-discord-youtube",
      // Обрабатываем конструкцию: markVersion.
      markVersion: "Mark version",
      // Обрабатываем конструкцию: markVersionHint.
      markVersionHint:
        // Обрабатываем конструкцию: If there is no .version file, mark the installed versio….
        "If there is no .version file, mark the installed version manually — otherwise the app cannot compare versions.",
      // Обрабатываем конструкцию: ignored.
      ignored: "Ignored versions",
      // Обрабатываем конструкцию: history.
      history: "Update history",
      // Обрабатываем конструкцию: noBackups.
      noBackups:
        // Обрабатываем конструкцию: No backups yet. They appear automatically before each u….
        "No backups yet. They appear automatically before each update.",
      // Обрабатываем конструкцию: upToDate.
      upToDate: "Up to date",
      // Обрабатываем конструкцию: available.
      available: "Available",
      // Обрабатываем конструкцию: availableVersion.
      availableVersion: "Available {version}",
      // Обрабатываем конструкцию: currentVersion.
      currentVersion: "Up to date {version}",
      // Обрабатываем конструкцию: checking.
      checking: "Checking…",
      // Обрабатываем конструкцию: noZip.
      noZip: "No .zip archive in the release — manual update required",
      // Обрабатываем конструкцию: versionAutoBefore.
      versionAutoBefore: "The version is detected automatically from the file",
      // Обрабатываем конструкцию: versionAutoMiddle.
      versionAutoMiddle: "and the contents of",
      // Обрабатываем конструкцию: versionAutoAfter.
      versionAutoAfter:
        // Обрабатываем конструкцию: . If both hints are missing, no update will be offered..
        ". If both hints are missing, no update will be offered.",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: advanced.
    advanced: {
      // Обрабатываем конструкцию: title.
      title: "Advanced",
      // Обрабатываем конструкцию: description.
      description:
        // Обрабатываем конструкцию: These settings are for advanced users. A wrong configur….
        "These settings are for advanced users. A wrong configuration may prevent strategies from starting.",
      // Обрабатываем конструкцию: loggingLevel.
      loggingLevel: "Logging level",
      // Обрабатываем конструкцию: logRetention.
      logRetention: "Log retention, days",
      // Обрабатываем конструкцию: logRetentionUnit.
      logRetentionUnit: "days",
      // Обрабатываем конструкцию: logRetentionHint.
      logRetentionHint:
        // Обрабатываем конструкцию: From {min} to {max} days. Files older than the limit ar….
        "From {min} to {max} days. Files older than the limit are removed on startup and whenever the value changes.",
      // Обрабатываем конструкцию: logRetentionPruned.
      logRetentionPruned: "Removed {count} log files older than {days} days",
      // Обрабатываем конструкцию: logRetentionFailed.
      logRetentionFailed: "Could not apply log retention: {error}",
      // Обрабатываем конструкцию: extraArgs.
      extraArgs: "Extra winws arguments",
      // Обрабатываем конструкцию: extraArgsHint.
      extraArgsHint: "Each argument is passed to winws as is",
      // Обрабатываем конструкцию: addArgument.
      addArgument: "Add argument",
      // Обрабатываем конструкцию: noArgs.
      noArgs: "No arguments set — stock values are used",
      // Обрабатываем конструкцию: leadingSpace.
      leadingSpace: "Leading space",
      // Обрабатываем конструкцию: disableUpdate.
      disableUpdate: "Disable update checks",
      // Обрабатываем конструкцию: disableUpdateHint.
      disableUpdateHint: "The app will stop checking for new strategy releases",
      // Обрабатываем конструкцию: engine.
      engine: {
        // Обрабатываем конструкцию: title.
        title: "Strategy engine",
        // Обрабатываем конструкцию: description.
        description:
          // Обрабатываем конструкцию: Auto picks the engine per strategy. Native runs winws.e….
          "Auto picks the engine per strategy. Native runs winws.exe directly without .bat and cmd.exe, Legacy runs .bat as before",
        // Обрабатываем конструкцию: auto.
        auto: "Auto",
        // Обрабатываем конструкцию: native.
        native: "Native",
        // Обрабатываем конструкцию: legacy.
        legacy: "Legacy .bat",
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: verify.
      verify: "Check configs",
      // Обрабатываем конструкцию: verifyTitle.
      verifyTitle: "Config check",
      // Обрабатываем конструкцию: verifyOk.
      verifyOk: "Checked {checked}: no problems found",
      // Обрабатываем конструкцию: verifyProblems.
      verifyProblems: "Checked {checked}, {problems} issues",
      // Обрабатываем конструкцию: verifyEmptyFiles.
      verifyEmptyFiles: "Empty: {list}",
      // Обрабатываем конструкцию: verifyDuplicates.
      verifyDuplicates: "Duplicates: {list}",
      // Обрабатываем конструкцию: verifyInvalid.
      verifyInvalid: "Invalid: {list}",
      // Обрабатываем конструкцию: danger.
      danger: "Danger zone",
      // Обрабатываем конструкцию: dangerHint.
      dangerHint: "Actions cannot be undone",
      // Обрабатываем конструкцию: resetAll.
      resetAll: "Reset all settings",
      // Обрабатываем конструкцию: clearLogs.
      clearLogs: "Clear all logs",
      // Обрабатываем конструкцию: deleteBackups.
      deleteBackups: "Delete all backups",
      // Обрабатываем конструкцию: uninstallApp.
      uninstallApp: "Uninstall app completely",
      // Обрабатываем конструкцию: uninstallTitle.
      uninstallTitle: "Uninstall the app?",
      // Обрабатываем конструкцию: uninstallHint.
      uninstallHint:
        // Обрабатываем конструкцию: The app, its settings, logs, unpacked resources and cac….
        "The app, its settings, logs, unpacked resources and cache will be removed. The app will close.",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: importExport.
    importExport: {
      // Обрабатываем конструкцию: exported.
      exported: "Settings exported to file",
      // Обрабатываем конструкцию: exportFailed.
      exportFailed: "Export failed: {error}",
      // Обрабатываем конструкцию: importFailed.
      importFailed: "Import failed: {error}",
      // Обрабатываем конструкцию: loaded.
      loaded: "Settings loaded from file",
      // Обрабатываем конструкцию: confirmTitle.
      confirmTitle: "Overwrite settings?",
      // Обрабатываем конструкцию: confirmDesc.
      confirmDesc:
        // Обрабатываем конструкцию: Current settings will be replaced with the file content….
        "Current settings will be replaced with the file contents. The strategies folder and last strategy stay as they are.",
      // Обрабатываем конструкцию: importerNote.
      importerNote:
        // Обрабатываем конструкцию: The “Strategies”, “Updates”, “General”, “Appearance”, “….
        "The “Strategies”, “Updates”, “General”, “Appearance”, “Advanced”, “VPN” and “Outlast Trials” sections are imported. The ignored versions list and last check time stay unchanged.",
      // Обрабатываем конструкцию: importAction.
      importAction: "Import",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: resources.
    resources: {
      // Обрабатываем конструкцию: title.
      title: "Built-in resources",
      // Обрабатываем конструкцию: description.
      description:
        // Обрабатываем конструкцию: Bypass strategies and the zapret engine installed with ….
        "Bypass strategies and the zapret engine installed with the app",
      // Обрабатываем конструкцию: version.
      version: "Resources version",
      // Обрабатываем конструкцию: location.
      location: "Location",
      // Обрабатываем конструкцию: locationHint.
      locationHint: "User folder in %APPDATA%",
      // Обрабатываем конструкцию: openFolder.
      openFolder: "Open folder",
      // Обрабатываем конструкцию: check.
      check: "Check integrity",
      // Обрабатываем конструкцию: checking.
      checking: "Checking…",
      // Обрабатываем конструкцию: restore.
      restore: "Restore bundled strategies",
      // Обрабатываем конструкцию: restoring.
      restoring: "Restoring…",
      // Обрабатываем конструкцию: restoreTitle.
      restoreTitle: "Restore bundled strategies?",
      // Обрабатываем конструкцию: restoreHint.
      restoreHint:
        // Обрабатываем конструкцию: This overwrites your changes in standard files. Your ow….
        "This overwrites your changes in standard files. Your own .bat files and domain list edits stay in place.",
      // Обрабатываем конструкцию: restoreConfirm.
      restoreConfirm: "Restore",
      // Обрабатываем конструкцию: restored.
      restored: "Files restored: {count}",
      // Обрабатываем конструкцию: restoredLog.
      restoredLog: "Resources restored: {count} files",
      // Обрабатываем конструкцию: restoreSkipped.
      restoreSkipped: "User files skipped: {count}",
      // Обрабатываем конструкцию: integrityOk.
      integrityOk: "All files present: {count}",
      // Обрабатываем конструкцию: integrityMissing.
      integrityMissing: "Missing files: {count}",
      // Обрабатываем конструкцию: integrityModified.
      integrityModified: "Modified files: {count}",
      // Обрабатываем конструкцию: integrityMixed.
      integrityMixed: "Missing {missing}, modified {modified}",
      // Обрабатываем конструкцию: notAvailable.
      notAvailable: "Built-in resources not found",
      // Обрабатываем конструкцию: notAvailableHint.
      notAvailableHint:
        // Обрабатываем конструкцию: The app works without them. Copy strategies into the fo….
        "The app works without them. Copy strategies into the folder manually or reinstall.",
      // Обрабатываем конструкцию: firstRunTitle.
      firstRunTitle: "First launch",
      // Обрабатываем конструкцию: firstRunHint.
      firstRunHint: "Unpacking bundled strategies and the zapret engine",
      // Обрабатываем конструкцию: firstRunDoNotClose.
      firstRunDoNotClose: "Do not close the window, unpacking is in progress",
      // Обрабатываем конструкцию: stageIdle.
      stageIdle: "Waiting",
      // Обрабатываем конструкцию: stageCopyingZapret.
      stageCopyingZapret: "Copying the zapret engine",
      // Обрабатываем конструкцию: stageCopyingStrategies.
      stageCopyingStrategies: "Copying strategies",
      // Обрабатываем конструкцию: stageCopyingVpn.
      stageCopyingVpn: "Unpacking the Xray core",
      // Обрабатываем конструкцию: stageFinalizing.
      stageFinalizing: "Finalizing",
      // Обрабатываем конструкцию: stageDone.
      stageDone: "Done",
      // Обрабатываем конструкцию: progressAriaLabel.
      progressAriaLabel: "Resource unpacking progress",
      // Обрабатываем конструкцию: welcomeTitle.
      welcomeTitle: "Welcome to Zapret",
      // Обрабатываем конструкцию: welcomeBody.
      welcomeBody:
        // Обрабатываем конструкцию: We have unpacked bundled strategies for Discord, YouTub….
        "We have unpacked bundled strategies for Discord, YouTube and Outlast Trials. You can start now.",
      // Обрабатываем конструкцию: welcomeAction.
      welcomeAction: "Get started",
      // Обрабатываем конструкцию: welcomeStrategies.
      welcomeStrategies: "Bundled strategies: {count}",
      // Обрабатываем конструкцию: welcomeEngine.
      welcomeEngine: "winws.exe engine and WinDivert",
      // Обрабатываем конструкцию: welcomeVpnCore.
      welcomeVpnCore: "Xray core for VPN mode",
      // Обрабатываем конструкцию: welcomeConfigs.
      welcomeConfigs: "Domain lists and templates",
      // Обрабатываем конструкцию: welcomeVersion.
      welcomeVersion: "Resources version {version}",
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: strategies.
  strategies: {
    // Обрабатываем конструкцию: page.
    page: {
      // Обрабатываем конструкцию: title.
      title: "Strategies",
      // Обрабатываем конструкцию: subtitle.
      subtitle: "Bypass card collection",
      // Обрабатываем конструкцию: updatedAt.
      updatedAt: "Updated at {time}",
      // Обрабатываем конструкцию: countOne.
      countOne: "{count} strategy",
      // Обрабатываем конструкцию: countFew.
      countFew: "{count} strategies",
      // Обрабатываем конструкцию: countMany.
      countMany: "{count} strategies",
      // Обрабатываем конструкцию: chooseFolder.
      chooseFolder: "Choose folder",
      // Обрабатываем конструкцию: refresh.
      refresh: "Refresh",
      // Обрабатываем конструкцию: searchPlaceholder.
      searchPlaceholder: "Search by name",
      // Обрабатываем конструкцию: searchAria.
      searchAria: "Search strategy by name",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: sort.
    sort: {
      // Обрабатываем конструкцию: title.
      title: "Sorting",
      // Обрабатываем конструкцию: rating.
      rating: "By rating",
      // Обрабатываем конструкцию: name.
      name: "Alphabetical",
      // Обрабатываем конструкцию: date.
      date: "By date",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: filters.
    filters: {
      // Обрабатываем конструкцию: ratingAll.
      ratingAll: "All",
      // Обрабатываем конструкцию: ratingMeasured.
      ratingMeasured: "Measured",
      // Обрабатываем конструкцию: ratingUnmeasured.
      ratingUnmeasured: "Unmeasured",
      // Обрабатываем конструкцию: reset.
      reset: "Reset",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: rating.
    rating: {
      // Обрабатываем конструкцию: noData.
      noData: "No data",
      // Обрабатываем конструкцию: pending.
      pending: "{samples} run — one more needed",
      // Обрабатываем конструкцию: score.
      score: "{score} / 100 · {samples} runs",
      // Обрабатываем конструкцию: statsHint.
      statsHint: "Speed, stability and coverage — from the file contents",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: stats.
    stats: {
      // Обрабатываем конструкцию: speed.
      speed: "Speed",
      // Обрабатываем конструкцию: stability.
      stability: "Stability",
      // Обрабатываем конструкцию: coverage.
      coverage: "Coverage",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: card.
    card: {
      // Обрабатываем конструкцию: type.
      type: "Type",
      // Обрабатываем конструкцию: size.
      size: "Size",
      // Обрабатываем конструкцию: changed.
      changed: "Changed",
      // Обрабатываем конструкцию: services.
      services: "Services",
      // Обрабатываем конструкцию: folder.
      folder: "Folder",
      // Обрабатываем конструкцию: closeAria.
      closeAria: "Close card",
      // Обрабатываем конструкцию: closeTitle.
      closeTitle: "Close",
      // Обрабатываем конструкцию: stop.
      stop: "Stop",
      // Обрабатываем конструкцию: run.
      run: "Run",
      // Обрабатываем конструкцию: detailsAria.
      detailsAria: "Details for strategy {name}",
      // Обрабатываем конструкцию: removeAria.
      removeAria: "Remove strategy {name}",
      // Обрабатываем конструкцию: removeTitle.
      removeTitle: "Remove",
      // Обрабатываем конструкцию: runningBadge.
      runningBadge: "Running",
      // Обрабатываем конструкцию: idleBadge.
      idleBadge: "Not running",
      // Обрабатываем конструкцию: gamesHint.
      gamesHint: "Games in this strategy",
      // Обрабатываем конструкцию: outlastHint.
      outlastHint: "Outlast Trials domains will be added to configs on launch",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: status.
    status: {
      // Обрабатываем конструкцию: idle.
      idle: "Not running",
      // Обрабатываем конструкцию: running.
      running: "Running",
      // Обрабатываем конструкцию: error.
      error: "Error",
      // Обрабатываем конструкцию: stopped.
      stopped: "Stopped",
      // Обрабатываем конструкцию: starting.
      starting: "Starting",
      // Обрабатываем конструкцию: stopping.
      stopping: "Stopping",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: overlay.
    overlay: {
      // Обрабатываем конструкцию: runAria.
      runAria: "Run strategy",
      // Обрабатываем конструкцию: stopAria.
      stopAria: "Stop strategy",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: empty.
    empty: {
      // Обрабатываем конструкцию: noFolderTitle.
      noFolderTitle: "No folder selected",
      // Обрабатываем конструкцию: noBatsTitle.
      noBatsTitle: "No .bat files in the folder",
      // Обрабатываем конструкцию: noFolderDesc.
      noFolderDesc:
        // Обрабатываем конструкцию: Select a folder with zapret .bat files to build your ca….
        "Select a folder with zapret .bat files to build your card collection.",
      // Обрабатываем конструкцию: noBatsDesc.
      noBatsDesc:
        // Обрабатываем конструкцию: No .bat files found at {folder}. Check the folder or ch….
        "No .bat files found at {folder}. Check the folder or choose another one.",
      // Обрабатываем конструкцию: chooseFolder.
      chooseFolder: "Choose folder",
      // Обрабатываем конструкцию: chooseAnother.
      chooseAnother: "Choose another folder",
      // Обрабатываем конструкцию: notFoundTitle.
      notFoundTitle: "Nothing found",
      // Обрабатываем конструкцию: notFoundDesc.
      notFoundDesc: "No cards match the current filters",
      // Обрабатываем конструкцию: resetFilters.
      resetFilters: "Reset filters",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: engine.
    engine: {
      // Обрабатываем конструкцию: auto.
      auto: "Auto",
      // Обрабатываем конструкцию: native.
      native: "Native",
      // Обрабатываем конструкцию: legacy.
      legacy: ".bat",
      // Обрабатываем конструкцию: effectiveHint.
      effectiveHint: "This strategy will run on: {engine}",
      // Обрабатываем конструкцию: configMissing.
      configMissing: "Not parsed",
      // Обрабатываем конструкцию: configMissingHint.
      configMissingHint:
        // Обрабатываем конструкцию: Strategy config was not parsed — it will run through le….
        "Strategy config was not parsed — it will run through legacy .bat",
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: monitor.
  monitor: {
    // Обрабатываем конструкцию: title.
    title: "Monitor",
    // Обрабатываем конструкцию: subtitle.
    subtitle: "Traffic and connections in real time",
    // Обрабатываем конструкцию: hint.
    hint: "Updates 10 times per second · 12 second buffer",
    // Обрабатываем конструкцию: controls.
    controls: {
      // Обрабатываем конструкцию: snapshot.
      snapshot: "Save charts to PNG",
      // Обрабатываем конструкцию: snapshotAria.
      snapshotAria: "Save chart snapshot",
      // Обрабатываем конструкцию: clear.
      clear: "Clear the buffer and restart the chart",
      // Обрабатываем конструкцию: clearAria.
      clearAria: "Clear chart buffer",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: counters.
    counters: {
      // Обрабатываем конструкцию: downloaded.
      downloaded: "Downloaded total",
      // Обрабатываем конструкцию: uploaded.
      uploaded: "Uploaded total",
      // Обрабатываем конструкцию: packets.
      packets: "Packets",
      // Обрабатываем конструкцию: connections.
      connections: "Connections",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: chart.
    chart: {
      // Обрабатываем конструкцию: in.
      in: "Incoming traffic",
      // Обрабатываем конструкцию: out.
      out: "Outgoing traffic",
      // Обрабатываем конструкцию: aria.
      aria: "Chart: {label}, {value}",
      // Обрабатываем конструкцию: frozen.
      frozen: "Paused — chart is frozen",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: totals.
    totals: "Session totals",
    // Обрабатываем конструкцию: live.
    live: "Now",
    // Обрабатываем конструкцию: speed.
    speed: {
      // Обрабатываем конструкцию: in.
      in: "inbound",
      // Обрабатываем конструкцию: out.
      out: "outbound",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: ping.
    ping: {
      // Обрабатываем конструкцию: section.
      section: "Service latency",
      // Обрабатываем конструкцию: aria.
      aria: "Latency to service {label}",
      // Обрабатываем конструкцию: waiting.
      waiting: "waiting for response…",
      // Обрабатываем конструкцию: measurementsOne.
      measurementsOne: "{count} sample per minute",
      // Обрабатываем конструкцию: measurementsFew.
      measurementsFew: "{count} samples per minute",
      // Обрабатываем конструкцию: measurementsMany.
      measurementsMany: "{count} samples per minute",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: status.
    status: {
      // Обрабатываем конструкцию: background.
      background: "Background mode",
      // Обрабатываем конструкцию: backgroundHint.
      backgroundHint: "Strategy is not running — showing all system traffic",
      // Обрабатываем конструкцию: active.
      active: "Bypass active",
      // Обрабатываем конструкцию: activeHint.
      activeHint: "Strategy is running, traffic flows",
      // Обрабатываем конструкцию: stalled.
      stalled: "Possible bypass issues",
      // Обрабатываем конструкцию: stalledHint.
      stalledHint:
        // Обрабатываем конструкцию: Strategy is running, but there has been no incoming tra….
        "Strategy is running, but there has been no incoming traffic for over 5 seconds",
      // Обрабатываем конструкцию: error.
      error: "Monitoring error",
      // Обрабатываем конструкцию: errorHint.
      errorHint: "Could not get traffic data",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: snapshotFailed.
    snapshotFailed: "Could not capture the chart image",
    // Обрабатываем конструкцию: snapshotSaved.
    snapshotSaved: "Monitor snapshot saved: {path}",
    // Обрабатываем конструкцию: snapshotNotSaved.
    snapshotNotSaved: "Snapshot not saved: {error}",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: logs.
  logs: {
    // Обрабатываем конструкцию: title.
    title: "Logs",
    // Обрабатываем конструкцию: subtitle.
    subtitle: "Strategy logs in real time",
    // Обрабатываем конструкцию: searchPlaceholder.
    searchPlaceholder: "Search log text",
    // Обрабатываем конструкцию: filterStrategy.
    filterStrategy: "Filter by strategy",
    // Обрабатываем конструкцию: allStrategies.
    allStrategies: "All strategies",
    // Обрабатываем конструкцию: autoScroll.
    autoScroll: "Autoscroll",
    // Обрабатываем конструкцию: export.
    export: "Export",
    // Обрабатываем конструкцию: clear.
    clear: "Clear",
    // Обрабатываем конструкцию: resetFilters.
    resetFilters: "Reset filters",
    // Обрабатываем конструкцию: countShown.
    countShown: "{shown} of {total}",
    // Обрабатываем конструкцию: countOne.
    countOne: "{count} entry",
    // Обрабатываем конструкцию: countFew.
    countFew: "{count} entries",
    // Обрабатываем конструкцию: countMany.
    countMany: "{count} entries",
    // Обрабатываем конструкцию: noMatchTitle.
    noMatchTitle: "Nothing found",
    // Обрабатываем конструкцию: noMatchDesc.
    noMatchDesc: "No logs match the current filters",
    // Обрабатываем конструкцию: emptyTitle.
    emptyTitle: "Logs are empty",
    // Обрабатываем конструкцию: disabledTitle.
    disabledTitle: "Logging is disabled",
    // Обрабатываем конструкцию: disabledDesc.
    disabledDesc: 'Turn on "Keep logs" in settings to see events',
    // Обрабатываем конструкцию: emptyDesc.
    emptyDesc: "Start a strategy to see logs",
    // Обрабатываем конструкцию: scrollAria.
    scrollAria: "Scroll to latest logs",
    // Обрабатываем конструкцию: scrollTitle.
    scrollTitle: "Scroll to bottom",
    // Обрабатываем конструкцию: clearDialog.
    clearDialog: {
      // Обрабатываем конструкцию: title.
      title: "Clear logs?",
      // Обрабатываем конструкцию: description.
      description: "Entries to be deleted: {count}. This cannot be undone.",
      // Обрабатываем конструкцию: body.
      body: "All journal lines will be erased from app memory. Previously exported files stay on disk.",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: toast.
    toast: {
      // Обрабатываем конструкцию: copied.
      copied: "Line copied",
      // Обрабатываем конструкцию: copyFailed.
      copyFailed: "Could not copy the line",
      // Обрабатываем конструкцию: exported.
      exported: "Exported {bytes} bytes",
      // Обрабатываем конструкцию: exportFailed.
      exportFailed: "Export error: {error}",
      // Обрабатываем конструкцию: cleared.
      cleared: "Logs cleared",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: levels.
    levels: {
      // Обрабатываем конструкцию: debug.
      debug: "debug",
      // Обрабатываем конструкцию: info.
      info: "info",
      // Обрабатываем конструкцию: success.
      success: "success",
      // Обрабатываем конструкцию: warn.
      warn: "warning",
      // Обрабатываем конструкцию: error.
      error: "error",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: sources.
    sources: {
      // Обрабатываем конструкцию: system.
      system: "system",
      // Обрабатываем конструкцию: strategy.
      strategy: "strategy",
      // Обрабатываем конструкцию: user.
      user: "user",
      // Обрабатываем конструкцию: vpn.
      vpn: "VPN",
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: updates.
  updates: {
    // Обрабатываем конструкцию: badge.
    badge: "Strategy update available: {version}",
    // Обрабатываем конструкцию: titleAvailable.
    titleAvailable: "Strategy update available",
    // Обрабатываем конструкцию: titleInstalled.
    titleInstalled: "Update installed",
    // Обрабатываем конструкцию: titleUpToDate.
    titleUpToDate: "You have the latest version",
    // Обрабатываем конструкцию: titleFailed.
    titleFailed: "Could not update strategies",
    // Обрабатываем конструкцию: done.
    done: "Done",
    // Обрабатываем конструкцию: hide.
    hide: "Hide",
    // Обрабатываем конструкцию: cancel.
    cancel: "Cancel",
    // Обрабатываем конструкцию: later.
    later: "Later",
    // Обрабатываем конструкцию: ignore.
    ignore: "Ignore",
    // Обрабатываем конструкцию: retry.
    retry: "Retry",
    // Обрабатываем конструкцию: download.
    download: "Download",
    // Обрабатываем конструкцию: install.
    install: "Install",
    // Обрабатываем конструкцию: checking.
    checking: "Checking for updates…",
    // Обрабатываем конструкцию: ignoredBadge.
    ignoredBadge: "Ignored",
    // Обрабатываем конструкцию: noZip.
    noZip: "No .zip archive in the release — manual update required",
    // Обрабатываем конструкцию: filesUpdated.
    filesUpdated: "Files updated: {count}",
    // Обрабатываем конструкцию: preserved.
    preserved: "your entries preserved: {count}",
    // Обрабатываем конструкцию: zapretUpdaterOff.
    zapretUpdaterOff: ". The stock zapret update check is disabled",
    // Обрабатываем конструкцию: unknownError.
    unknownError: "Unknown error — see the logs for details",
    // Обрабатываем конструкцию: downloadedHint.
    downloadedHint:
      // Обрабатываем конструкцию: The archive is downloaded and ready to install. A backu….
      "The archive is downloaded and ready to install. A backup will be created before replacing files.",
    // Обрабатываем конструкцию: installingHint.
    installingHint: "Creating backup, replacing files…",
    // Обрабатываем конструкцию: backupEmpty.
    backupEmpty:
      // Обрабатываем конструкцию: No backups yet. They appear automatically before each u….
      "No backups yet. They appear automatically before each update.",
    // Обрабатываем конструкцию: revert.
    revert: "Revert",
    // Обрабатываем конструкцию: changelogEmpty.
    changelogEmpty: "No release notes available.",
    // Обрабатываем конструкцию: progressAria.
    progressAria: "Downloading update",
    // Обрабатываем конструкцию: progressOf.
    progressOf: "of {total}",
    // Обрабатываем конструкцию: progressSpeed.
    progressSpeed: "{speed}/s · {eta}",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: dashboard.
  dashboard: {
    // Обрабатываем конструкцию: version.
    version: "Version {version}",
    // Обрабатываем конструкцию: subtitle.
    subtitle: "Bypass management",
    // Обрабатываем конструкцию: tray.
    tray: {
      // Обрабатываем конструкцию: disconnected.
      disconnected: "Disconnected",
      // Обрабатываем конструкцию: vpnConnect.
      vpnConnect: "Connect VPN",
      // Обрабатываем конструкцию: vpnDisconnect.
      vpnDisconnect: "Disconnect VPN",
      // Обрабатываем конструкцию: about.
      about: "About",
      // Обрабатываем конструкцию: active.
      active: "Active",
      // Обрабатываем конструкцию: run.
      run: "Run last strategy",
      // Обрабатываем конструкцию: stop.
      stop: "Stop",
      // Обрабатываем конструкцию: dashboard.
      dashboard: "Dashboard",
      // Обрабатываем конструкцию: strategies.
      strategies: "Strategies",
      // Обрабатываем конструкцию: logs.
      logs: "Logs",
      // Обрабатываем конструкцию: settings.
      settings: "Settings",
      // Обрабатываем конструкцию: checkUpdates.
      checkUpdates: "Check for updates",
      // Обрабатываем конструкцию: quit.
      quit: "Quit",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: modeSwitcher.
    modeSwitcher: {
      // Обрабатываем конструкцию: ariaLabel.
      ariaLabel: "Switch bypass mode",
      // Обрабатываем конструкцию: dpi.
      dpi: "Bypass",
      // Обрабатываем конструкцию: vpn.
      vpn: "VPN",
      // Обрабатываем конструкцию: activeDpi.
      activeDpi: "Mode: DPI bypass",
      // Обрабатываем конструкцию: activeVpn.
      activeVpn: "Mode: VPN",
      // Обрабатываем конструкцию: switchToDpi.
      switchToDpi: "Switch to bypass",
      // Обрабатываем конструкцию: switchToVpn.
      switchToVpn: "Switch to VPN",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: hero.
    hero: {
      // Обрабатываем конструкцию: connected.
      connected: "Bypass is active",
      // Обрабатываем конструкцию: connecting.
      connecting: "Connecting...",
      // Обрабатываем конструкцию: disconnected.
      disconnected: "Bypass is off",
      // Обрабатываем конструкцию: vpn.
      vpn: "VPN is active",
      // Обрабатываем конструкцию: error.
      error: "Launch error occurred",
      // Обрабатываем конструкцию: notConfigured.
      notConfigured: "Bypass is not configured",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: connection.
    connection: {
      // Обрабатываем конструкцию: title.
      title: "Connection info",
      // Обрабатываем конструкцию: refresh.
      refresh: "Refresh",
      // Обрабатываем конструкцию: refreshAria.
      refreshAria: "Refresh connection info",
      // Обрабатываем конструкцию: ip.
      ip: "IP address",
      // Обрабатываем конструкцию: isp.
      isp: "Provider",
      // Обрабатываем конструкцию: failed.
      failed: "Could not detect IP: {error}",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: ping.
    ping: {
      // Обрабатываем конструкцию: title.
      title: "Service latency",
      // Обрабатываем конструкцию: hint.
      hint: "TCP availability on port 443, refreshed every 2 seconds",
      // Обрабатываем конструкцию: hintCompact.
      hintCompact: "TCP, port 443, every 2 seconds",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: recentLogs.
    recentLogs: {
      // Обрабатываем конструкцию: title.
      title: "Recent events",
      // Обрабатываем конструкцию: openAll.
      openAll: "All logs",
      // Обрабатываем конструкцию: empty.
      empty: "No logs yet. Start a strategy — events will appear here.",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: orb.
    orb: {
      // Обрабатываем конструкцию: aria.
      aria: "Protection status: {status}",
      // Закрываем текущий блок.
    },
    // Обрабатываем конструкцию: vpn.
    vpn: {
      // Обрабатываем конструкцию: disabledHint.
      disabledHint: "VPN is disabled in settings",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: subscription.
      subscription: {
        // Обрабатываем конструкцию: title.
        title: "My subscription",
        // Обрабатываем конструкцию: active.
        active: "Active",
        // Обрабатываем конструкцию: expired.
        expired: "Expired",
        // Обрабатываем конструкцию: notAdded.
        notAdded: "No subscription",
        // Обрабатываем конструкцию: notAddedHint.
        notAddedHint:
          // Обрабатываем конструкцию: Add the providers subscription link — servers will load….
          "Add the provider's subscription link — servers will load automatically. The VPN is unlocked afterwards.",
        // Обрабатываем конструкцию: traffic.
        traffic: "{used} GB / {limit} GB",
        // Обрабатываем конструкцию: percent.
        percent: "{percent}%",
        // Обрабатываем конструкцию: daysLeft.
        daysLeft: "{days} days left",
        // Обрабатываем конструкцию: daysLeftOne.
        daysLeftOne: "{days} day left",
        // Обрабатываем конструкцию: daysLeftFew.
        daysLeftFew: "{days} days left",
        // Обрабатываем конструкцию: pay.
        pay: "Pay",
        // Обрабатываем конструкцию: renew.
        renew: "Renew subscription",
        // Обрабатываем конструкцию: loading.
        loading: "Loading…",
        // Обрабатываем конструкцию: trafficAriaLabel.
        trafficAriaLabel: "Used traffic",
        // Обрабатываем конструкцию: servers.
        servers: "Servers",
        // Обрабатываем конструкцию: expires.
        expires: "Valid until",
        // Обрабатываем конструкцию: expiryNotSent.
        expiryNotSent: "Term not provided by the panel",
        // Обрабатываем конструкцию: add.
        add: "Add subscription",
        // Обрабатываем конструкцию: remove.
        remove: "Remove",
        // Обрабатываем конструкцию: refresh.
        refresh: "Refresh",
        // Обрабатываем конструкцию: resetTraffic.
        resetTraffic: "Reset traffic",
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: addSubscription.
      addSubscription: {
        // Обрабатываем конструкцию: title.
        title: "Add subscription",
        // Обрабатываем конструкцию: hint.
        hint: "After the purchase Maxima VPS sends an email with your subscription link. Paste the link here—or the whole email—and the app will find the link itself.",
        // Обрабатываем конструкцию: url.
        url: "Link or email",
        // Обрабатываем конструкцию: placeholder.
        placeholder: "https://…/sub/… or the whole email",
        // Обрабатываем конструкцию: paste.
        paste: "Paste from clipboard",
        // Обрабатываем конструкцию: cancel.
        cancel: "Cancel",
        // Обрабатываем конструкцию: checking.
        checking: "Checking…",
        // Обрабатываем конструкцию: submit.
        submit: "Add",
        // Обрабатываем конструкцию: siteRoot.
        siteRoot:
          // Обрабатываем конструкцию: That is the site address, not a subscription. Your own ….
          "That is the site address, not a subscription. Your own link arrives by email after the purchase — it looks like https://…/sub/key",
        // Обрабатываем конструкцию: empty.
        empty: "Paste the link from the email, or the whole email",
        // Обрабатываем конструкцию: mailboxHint.
        mailboxHint:
          // Обрабатываем конструкцию: That is a webmail page, not a subscription. Open the em….
          "That is a webmail page, not a subscription. Open the email itself and copy its whole text (Ctrl+A, Ctrl+C) — the app will find the link. Or sign in to the Maxima account and copy the subscription link there.",
        // Обрабатываем конструкцию: cabinetHint.
        cabinetHint:
          // Обрабатываем конструкцию: This is a welcome email: it has the account link, not t….
          "This is a welcome email: it has the account link, not the subscription. Open the account, copy the subscription link there, and paste it into the field above.",
        // Обрабатываем конструкцию: cabinetOpen.
        cabinetOpen: "Open account window",
        // Обрабатываем конструкцию: cabinetFailed.
        cabinetFailed: "Could not open the account: {error}",
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: autoConnect.
      autoConnect: {
        // Обрабатываем конструкцию: idle.
        idle: "Smart connect",
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: searching.
        searching: "Looking for the best server...",
        // Обрабатываем конструкцию: connectedTo.
        connectedTo: "Connected: {name} ({ping} ms)",
        // Обрабатываем конструкцию: noServers.
        noServers: "No available servers",
        // Обрабатываем конструкцию: connectionFailed.
        connectionFailed: "Could not connect",
        // Обрабатываем конструкцию: coreChecking.
        coreChecking: "Checking the Xray core…",
        // Обрабатываем конструкцию: coreUnpacking.
        coreUnpacking: "Unpacking the bundled Xray core…",
        // Обрабатываем конструкцию: coreDownloading.
        coreDownloading: "Downloading the Xray core…",
        // Обрабатываем конструкцию: coreReady.
        coreReady: "Xray core is ready",
        // Обрабатываем конструкцию: checkConnection.
        checkConnection: "Check your connection",
        // Обрабатываем конструкцию: failed.
        failed: "Servers did not respond, connection failed",
        // Обрабатываем конструкцию: subscriptionRequired.
        subscriptionRequired:
          // Обрабатываем конструкцию: Add a subscription first — the VPN cannot connect witho….
          "Add a subscription first — the VPN cannot connect without it",
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: payment.
      payment: {
        // Обрабатываем конструкцию: title.
        title: "Buy VPN",
        // Обрабатываем конструкцию: subtitle.
        subtitle:
          // Обрабатываем конструкцию: Connect more devices and use VPN together with friends ….
          "Connect more devices and use VPN together with friends and family",
        // Обрабатываем конструкцию: devices.
        devices: "Number of devices",
        // Обрабатываем конструкцию: devicesAria.
        devicesAria: "How many devices the subscription covers",
        // Обрабатываем конструкцию: devicesHint.
        devicesHint: "Selected: {devices}",
        // Обрабатываем конструкцию: perMonth.
        perMonth: "{price} ₽ per month",
        // Обрабатываем конструкцию: email.
        email: "Email for the subscription",
        // Обрабатываем конструкцию: emailPlaceholder.
        emailPlaceholder: "you@example.com",
        // Обрабатываем конструкцию: emailHint.
        emailHint:
          // Обрабатываем конструкцию: After payment the subscription link is sent to this add….
          "After payment the subscription link is sent to this address",
        // Обрабатываем конструкцию: emailInvalid.
        emailInvalid: "Enter a valid email",
        // Обрабатываем конструкцию: terms.
        terms:
          // Обрабатываем конструкцию: I accept the offer agreement, data processing and recur….
          "I accept the offer agreement, data processing and recurring payments",
        // Обрабатываем конструкцию: pay.
        pay: "Pay {price} ₽",
        // Обрабатываем конструкцию: windowTitle.
        windowTitle: "Payment",
        // Обрабатываем конструкцию: cabinetTitle.
        cabinetTitle: "Account",
        // Обрабатываем конструкцию: autoAddedTitle.
        autoAddedTitle: "Subscription added",
        // Обрабатываем конструкцию: autoAddedBody.
        autoAddedBody:
          // Обрабатываем конструкцию: We found the subscription link right in the payment win….
          "We found the subscription link right in the payment window and added it automatically.",
        // Обрабатываем конструкцию: autoAddFailed.
        autoAddFailed:
          // Обрабатываем конструкцию: Could not add the link from the payment window automati….
          "Could not add the link from the payment window automatically — paste it manually.",
        // Обрабатываем конструкцию: watchHint.
        watchHint:
          // Обрабатываем конструкцию: The payment window watches the site: as soon as the sub….
          "The payment window watches the site: as soon as the subscription appears after checkout, it is added automatically.",
        // Обрабатываем конструкцию: inAppHint.
        inAppHint:
          // Обрабатываем конструкцию: Payment opens inside the app: the site gets no access t….
          "Payment opens inside the app: the site gets no access to login data or desktop commands.",
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: tariff.
      tariff: {
        // Обрабатываем конструкцию: month1.
        month1: "1 month",
        // Обрабатываем конструкцию: month3.
        month3: "3 months",
        // Обрабатываем конструкцию: month6.
        month6: "6 months",
        // Обрабатываем конструкцию: year.
        year: "1 year",
        // Обрабатываем конструкцию: popular.
        popular: "Popular",
        // Обрабатываем конструкцию: profitable.
        profitable: "Best value",
        // Обрабатываем конструкцию: best.
        best: "Best choice",
        // Закрываем текущий блок.
      },
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: clickToConnect.
      clickToConnect: "Press to connect",
      // Обрабатываем конструкцию: connecting.
      connecting: "Connecting…",
      // Обрабатываем конструкцию: connectedTo.
      connectedTo: "Connected to {name}",
      // Обрабатываем конструкцию: connectFailed.
      connectFailed: "Connection failed",
      // Обрабатываем конструкцию: disconnectAria.
      disconnectAria: "Disconnect VPN",
      // Обрабатываем конструкцию: disconnect.
      disconnect: "Disconnect",
      // Обрабатываем конструкцию: connectAria.
      connectAria: "Connect VPN",
      // Обрабатываем конструкцию: add.
      add: "Add",
      // Обрабатываем конструкцию: paste.
      paste: "Paste",
      // Обрабатываем конструкцию: pasteEmpty.
      pasteEmpty: "The clipboard holds no WireGuard configuration",
      // Обрабатываем конструкцию: settings.
      settings: "VPN settings",
      // Обрабатываем конструкцию: servers.
      servers: "SERVERS",
      // Обрабатываем конструкцию: serversCount.
      serversCount: "Servers",
      // Обрабатываем конструкцию: refreshPings.
      refreshPings: "Refresh pings",
      // Обрабатываем конструкцию: refreshPingsAria.
      refreshPingsAria: "Refresh server latencies",
      // Обрабатываем конструкцию: moreActions.
      moreActions: "Server list actions",
      // Обрабатываем конструкцию: noConfigs.
      noConfigs: "No VPN configurations",
      // Обрабатываем конструкцию: noConfigsHint.
      noConfigsHint: "Add a subscription link to load the server list",
      // Обрабатываем конструкцию: chooseFile.
      chooseFile: "Choose file",
      // Обрабатываем конструкцию: rename.
      rename: "Rename",
      // Обрабатываем конструкцию: export.
      export: "Export",
      // Обрабатываем конструкцию: delete.
      delete: "Delete",
      // Обрабатываем конструкцию: selectServer.
      selectServer: "Connect to server {name}",
      // Обрабатываем конструкцию: traffic.
      traffic: "Traffic",
      // Обрабатываем конструкцию: uptime.
      uptime: "Uptime",
      // Обрабатываем конструкцию: handshake.
      handshake: "Handshake",
      // Обрабатываем конструкцию: handshakeNever.
      handshakeNever: "never",
      // Обрабатываем конструкцию: wireguardMissing.
      wireguardMissing: "WireGuard is not installed",
      // Обрабатываем конструкцию: wireguardMissingHint.
      wireguardMissingHint:
        // Обрабатываем конструкцию: Install WireGuard or AmneziaWG to connect with configs.
        "Install WireGuard or AmneziaWG to connect with configs",
      // Обрабатываем конструкцию: endpointUnknown.
      endpointUnknown: "Endpoint unknown",
      // Обрабатываем конструкцию: settingsPanel.
      settingsPanel: "VPN settings",
      // Обрабатываем конструкцию: closeSettings.
      closeSettings: "Close VPN settings",
      // Обрабатываем конструкцию: addLink.
      addLink: "Add link",
      // Обрабатываем конструкцию: addLinkTitle.
      addLinkTitle: "Link or subscription",
      // Обрабатываем конструкцию: addLinkHint.
      addLinkHint:
        // Обрабатываем конструкцию: https subscriptions and vless, vmess, trojan, ss, socks….
        "https subscriptions and vless, vmess, trojan, ss, socks links are supported",
      // Обрабатываем конструкцию: subscriptionUrl.
      subscriptionUrl: "Link or subscription",
      // Обрабатываем конструкцию: linkPlaceholder.
      linkPlaceholder: "https://… or vless://…",
      // Обрабатываем конструкцию: subscriptionLoad.
      subscriptionLoad: "Load servers",
      // Обрабатываем конструкцию: subscriptionLoading.
      subscriptionLoading: "Loading…",
      // Обрабатываем конструкцию: subscriptionClear.
      subscriptionClear: "Clear subscription",
      // Обрабатываем конструкцию: subscriptionCount.
      subscriptionCount: "Servers in subscription: {count}",
      // Обрабатываем конструкцию: refreshSubscription.
      refreshSubscription: "Refresh subscription",
      // Обрабатываем конструкцию: refreshAll.
      refreshAll: "Refresh subscription and pings",
      // Обрабатываем конструкцию: serverMenu.
      serverMenu: "Server actions {name}",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: serverMenuConnect.
      serverMenuConnect: "Connect",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: serverMenuCopy.
      serverMenuCopy: "Copy link",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: serverMenuCopied.
      serverMenuCopied: "Copied",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: serverMenuDelete.
      serverMenuDelete: "Remove",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: removeServer.
      removeServer: "Remove server {name}",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: clearAllTitle.
      clearAllTitle: "Remove all servers?",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: clearAllHint.
      clearAllHint:
        // Обрабатываем конструкцию: The servers disappear from the list until the subscript….
        "The servers disappear from the list until the subscription is refreshed.",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: clearSubscription.
      clearSubscription: "Clear subscription",
      // Обрабатываем конструкцию: coreTitle.
      coreTitle: "Connection core",
      // Обрабатываем конструкцию: coreInstalled.
      coreInstalled: "Xray core is installed and ready",
      // Обрабатываем конструкцию: coreMissing.
      coreMissing: "Xray core is not installed yet",
      // Обрабатываем конструкцию: coreInstalling.
      coreInstalling: "Installing core…",
      // Обрабатываем конструкцию: installCore.
      installCore: "Install core",
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: ui.
  ui: {
    // Обрабатываем конструкцию: closeAria.
    closeAria: "Close window",
    // Обрабатываем конструкцию: loading.
    loading: "Loading",
    // Обрабатываем конструкцию: pageLoading.
    pageLoading: "Loading page",
    // Обрабатываем конструкцию: perfAria.
    perfAria: "Performance metrics",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: about.
  about: {
    // Обрабатываем конструкцию: title.
    title: "About",
    // Обрабатываем конструкцию: description.
    description: "Version, environment and links",
    // Обрабатываем конструкцию: system.
    system: "System",
    // Обрабатываем конструкцию: systemLoading.
    systemLoading: "Collecting system info…",
    // Обрабатываем конструкцию: os.
    os: "OS",
    // Обрабатываем конструкцию: arch.
    arch: "Architecture",
    // Обрабатываем конструкцию: webview.
    webview: "WebView2",
    // Обрабатываем конструкцию: rust.
    rust: "Rust",
    // Обрабатываем конструкцию: tauri.
    tauri: "Tauri",
    // Обрабатываем конструкцию: links.
    links: "Links",
    // Обрабатываем конструкцию: checkUpdates.
    checkUpdates: "Check for updates",
    // Обрабатываем конструкцию: openLogs.
    openLogs: "Open logs folder",
    // Обрабатываем конструкцию: openConfig.
    openConfig: "Open config folder",
    // Обрабатываем конструкцию: openStrategies.
    openStrategies: "Open strategies folder",
    // Обрабатываем конструкцию: copyInfo.
    copyInfo: "Copy system info",
    // Обрабатываем конструкцию: upstream.
    upstream: "zapret-discord-youtube repository",
    // Обрабатываем конструкцию: licenses.
    licenses: "Licenses",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: licenses.
  licenses: {
    // Обрабатываем конструкцию: title.
    title: "Licenses",
    // Обрабатываем конструкцию: description.
    description:
      // Обрабатываем конструкцию: The app bundles the zapret engine and uses open-source ….
      "The app bundles the zapret engine and uses open-source components",
    // Обрабатываем конструкцию: openSource.
    openSource: "Open source",
    // Обрабатываем конструкцию: close.
    close: "Close",
    // Обрабатываем конструкцию: remoteOnly.
    remoteOnly: "The license text is available in the project repository",
    // Обрабатываем конструкцию: item.
    item: {
      // Обрабатываем конструкцию: zapret.
      zapret: "zapret — bypass engine",
      // Обрабатываем конструкцию: zapretNotes.
      zapretNotes: "zapret build and its contents",
      // Обрабатываем конструкцию: xray.
      xray: "Xray-core — VPN core",
      // Обрабатываем конструкцию: tauri.
      tauri: "Tauri — app shell",
      // Обрабатываем конструкцию: react.
      react: "React — interface",
      // Обрабатываем конструкцию: lucide.
      lucide: "lucide-react — icons",
      // Обрабатываем конструкцию: framerMotion.
      framerMotion: "framer-motion — animations",
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  },
  // Закрываем текущий блок.
};
// — разделитель логических блоков —
