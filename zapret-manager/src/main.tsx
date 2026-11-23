// Импортируем зависимости из модуля react.
import React from "react";
// Импортируем зависимости из модуля react-dom/client.
import ReactDOM from "react-dom/client";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/styles/fonts.css.
import "@/styles/fonts.css";
// Импортируем зависимости из модуля @/styles/globals.css.
import "@/styles/globals.css";
// Импортируем зависимости из модуля @/styles/container-queries.css.
import "@/styles/container-queries.css";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/app/Root.
import Root from "@/app/Root";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const container = document.getElementById(root).
const container = document.getElementById("root");
// — разделитель логических блоков —

// Проверяем бизнес-условие: container === null.
if (container === null) {
  // Выбрасываем исключение throw new Error(Элемент #root не найден в index.ht….
  throw new Error("Элемент #root не найден в index.html");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: document.
document.addEventListener("contextmenu", (event) => {
  // Обрабатываем конструкцию: const target = event.target.
  const target = event.target;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: target instanceof HTMLElement && (target.closest(input,….
  if (
    // Обрабатываем конструкцию: target.
    target instanceof HTMLElement &&
    // Обрабатываем конструкцию: (target.closest(input, textarea, [contenteditable=true]….
    (target.closest("input, textarea, [contenteditable='true']") !== null ||
      // Обрабатываем конструкцию: window.
      window.getSelection()?.toString() !== "")
    // Закрываем выражение или список аргументов.
  ) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: event.
  event.preventDefault();
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: const isTrayView = new URLSearchParams(window.location.….
const isTrayView =
  // Создаём экземпляр URLSearchParams.
  new URLSearchParams(window.location.search).get("view") === "tray";
// — разделитель логических блоков —

// Проверяем бизнес-условие: isTrayView.
if (isTrayView) {
  // Обрабатываем конструкцию: document.
  document.documentElement.dataset.view = "tray";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: ReactDOM.
ReactDOM.createRoot(container).render(
  // Обрабатываем конструкцию: <React.StrictMode>.
  <React.StrictMode>
    {/* Выводим текстовое содержимое в JSX. */}
    <Root trayView={isTrayView} />
    {/* Выводим текстовое содержимое в JSX. */}
  </React.StrictMode>
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —
