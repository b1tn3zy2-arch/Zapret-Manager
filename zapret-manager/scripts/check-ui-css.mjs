import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Проверки CSS-контракта интерфейса.
 *
 * Здесь ловятся регрессии, которые не видны в типах, но сразу бьют по
 * интерфейсу: масштаб, уехавший с корня на body, глобальное правило
 * !important, которое ломает анимации Framer Motion, и выключенный индикатор
 * работающей стратегии.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/styles/globals.css"), "utf8");

const problems = [];

function check(condition, message) {
  if (!condition) {
    problems.push(message);
  }
}

function ruleBody(cssText, selector) {
  const index = cssText.indexOf(selector);

  if (index === -1) {
    return null;
  }

  const start = cssText.indexOf("{", index);

  if (start === -1) {
    return null;
  }

  const end = cssText.indexOf("}", start);

  return end === -1 ? null : cssText.slice(start, end + 1);
}

// 1. Масштаб интерфейса должен стоять на корне: Tailwind считает rem от html,
// применить масштаб к body значит не масштабировать интерфейс вообще.
const htmlRule = ruleBody(css, "html {") ?? "";
const bodyRule = ruleBody(css, "body {") ?? "";

check(
  htmlRule.includes("--interface-scale"),
  "масштаб интерфейса не применяется к корню (html): Tailwind считает rem от html"
);
check(
  !bodyRule.includes("--interface-scale"),
  "font-size с масштабом остался на body: интерфейс на утилитах Tailwind не масштабируется"
);
check(
  !/transition:\s*font-size/.test(css),
  "font-size анимируется переходом: при перетаскивании ползунка переход перезапускается каждый кадр"
);

// 2. Размеры в rem, иначе масштаб их не касается.
for (const [token, pattern] of [
  ["--radius-lg", /--radius-lg:\s*[\d.]+rem/],
  ["--space-lg", /--space-lg:\s*clamp\([\d.]+rem/],
  ["--sidebar-width-expanded", /--sidebar-width-expanded:\s*clamp\([\d.]+rem/],
  ["--titlebar-height", /--titlebar-height:\s*clamp\([\d.]+rem/],
]) {
  check(
    pattern.test(css),
    `${token} задан в пикселях: масштаб интерфейса его не меняет`
  );
}

// 3. Скорость анимаций: никакого глобального !important на transition-duration.
check(
  !/body\s*\*[^{]*\{[^}]*transition-duration[^}]*!important/.test(css),
  "transition-duration переписывается у всех элементов через !important: это ломает анимации Framer Motion"
);
check(
  css.includes("--duration-scale"),
  "нет --duration-scale: скорость анимаций ни на что не влияет"
);
check(
  /transition-duration:\s*calc\(/.test(css),
  "нет точечного правила для transition-duration"
);
check(
  /animation-duration:\s*calc\(/.test(css),
  "скорость анимаций не влияет на keyframes, только на переходы"
);

// 4. Статус запуска стратегии не украшение и не CSS-анимация:
// глобальное отключение анимаций не может погасить состояние,
// а halo-слои из 1.0.0 удалены и не должны возвращаться.
check(
  /\[data-animations="off"\]\s*\*/.test(css),
  "нет глобального отключения анимаций: редуцированный режим не работает"
);
check(
  !/strategy-card-halo/.test(css),
  "halo-пульсация карточек вернулась: декорации удалены в 1.0.0"
);

if (problems.length > 0) {
  console.error("CSS-контракт интерфейса нарушен:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log("CSS-контракт интерфейса в порядке");
}
