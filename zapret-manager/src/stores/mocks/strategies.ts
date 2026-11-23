// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const USE_MOCKS = import.meta.env.DEV;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MOCK_DIR = String.rawC:\Program Files\Zapret\zapr….
const MOCK_DIR = String.raw`C:\Program Files\Zapret\zapret`;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MOCK_STRATEGIES: Strategy[] = [
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-general-baseline",
    // Обрабатываем конструкцию: name.
    name: "General Baseline",
    // Обрабатываем конструкцию: filename.
    filename: "general-00-baseline.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-00-baseline.bat`,
    // Обрабатываем конструкцию: description.
    description: "Базовая стратегия zapret с multisplit и fake",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: [
      // Обрабатываем конструкцию: fake.
      "fake",
      // Обрабатываем конструкцию: multisplit.
      "multisplit",
      // Обрабатываем конструкцию: split-seqovl.
      "split-seqovl",
      // Обрабатываем конструкцию: quic-fake.
      "quic-fake",
      // Обрабатываем конструкцию: l7-filter.
      "l7-filter",
      // Обрабатываем конструкцию: ipset.
      "ipset",
      // Обрабатываем конструкцию: any-protocol.
      "any-protocol",
      // Обрабатываем конструкцию: cutoff.
      "cutoff",
      // Закрываем массив или список.
    ],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "running",
    // Обрабатываем конструкцию: lastRun.
    lastRun: Date.now() - 3_600_000,
    // Обрабатываем конструкцию: pid.
    pid: 18244,
    // Обрабатываем конструкцию: version.
    version: "1.10.3",
    // Обрабатываем конструкцию: size.
    size: 3351,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 86_400_000,
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-general-alt",
    // Обрабатываем конструкцию: name.
    name: "General Alt",
    // Обрабатываем конструкцию: filename.
    filename: "general-01-alt.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-01-alt.bat`,
    // Обрабатываем конструкцию: description.
    description: "Альтернативный набор multisplit без fake",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["multisplit", "split-seqovl", "ipset"],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 3877,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 172_800_000,
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-outlast",
    // Обрабатываем конструкцию: name.
    name: "General Fake TLS Auto",
    // Обрабатываем конструкцию: filename.
    filename: "general-18-faketls-auto.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-18-faketls-auto.bat`,
    // Обрабатываем конструкцию: description.
    description: "FakeTLS с автоматическим подбором паттерна",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["faketls", "multisplit", "split-seqovl", "ipset"],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 4017,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 259_200_000,
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-simple-fake",
    // Обрабатываем конструкцию: name.
    name: "General Simple Fake",
    // Обрабатываем конструкцию: filename.
    filename: "general-15-simple-fake.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-15-simple-fake.bat`,
    // Обрабатываем конструкцию: description.
    description: "Простой fake без дополнительных техник",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["fake", "ipset"],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "stopped",
    // Обрабатываем конструкцию: size.
    size: 3497,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 345_600_000,
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-experimental",
    // Обрабатываем конструкцию: name.
    name: "General Experimental",
    // Обрабатываем конструкцию: filename.
    filename: "general-14-experimental.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-14-experimental.bat`,
    // Обрабатываем конструкцию: description.
    description: "Экспериментальная комбинация any-protocol и cutoff",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["multisplit", "any-protocol", "cutoff", "ipset"],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "error",
    // Обрабатываем конструкцию: error.
    error: "Не удалось запустить winws.exe: доступ запрещён",
    // Обрабатываем конструкцию: size.
    size: 4275,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 432_000_000,
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "mock-outlast-user",
    // Обрабатываем конструкцию: name.
    name: "General ALT13",
    // Обрабатываем конструкцию: filename.
    filename: "general-13-alt.bat",
    // Обрабатываем конструкцию: path.
    path: `${MOCK_DIR}\\general-13-alt.bat`,
    // Обрабатываем конструкцию: description.
    description: "Зарезервировано под инъекцию Outlast Trials",
    // Обрабатываем конструкцию: services.
    services: ["general"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["fake", "multisplit", "quic-fake"],
    // Обрабатываем конструкцию: fileType.
    fileType: "winws",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 4166,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: Date.now() - 518_400_000,
    // Закрываем текущий блок.
  },
  // Закрываем массив или список.
];
// — разделитель логических блоков —
