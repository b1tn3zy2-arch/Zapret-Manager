// Импортируем зависимости из модуля lucide-react.
import { Plus } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AddGameButtonProps {
  // Обрабатываем конструкцию: disabled.
  disabled: boolean;
  // Обрабатываем конструкцию: onClick.
  onClick: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AddGameButton({
  // Обрабатываем конструкцию: disabled.
  disabled,
  // Обрабатываем конструкцию: onClick.
  onClick,
  // Закрываем текущий блок.
}: AddGameButtonProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Button fullWidth variant=secondary disabled={disable….
  return (
    // Обрабатываем конструкцию: <Button fullWidth variant=secondary disabled={disabled}….
    <Button
      // Задаём атрибут fullWidth элемента.
      fullWidth
      // Обрабатываем конструкцию: variant.
      variant="secondary"
      // Обрабатываем конструкцию: disabled.
      disabled={disabled}
      // Обрабатываем конструкцию: onClick.
      onClick={onClick}
      // Обрабатываем конструкцию: icon.
      icon={<Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {t("settings.games.add")}
      {/* Выводим текстовое содержимое в JSX. */}
    </Button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
