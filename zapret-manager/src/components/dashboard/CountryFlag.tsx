// Импортируем зависимости из модуля @/lib/geo.
import { countryCodeToFlagSrc } from "@/lib/geo";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface CountryFlagProps {
  // Обрабатываем конструкцию: countryCode.
  countryCode: string;
  // Обрабатываем конструкцию: countryName.
  countryName?: string | undefined;
  // Обрабатываем конструкцию: size.
  size?: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию CountryFlag.
function CountryFlag({
  // Обрабатываем конструкцию: countryCode.
  countryCode,
  // Обрабатываем конструкцию: countryName.
  countryName,
  // Обрабатываем конструкцию: size.
  size = 32,
  // Закрываем текущий блок.
}: CountryFlagProps) {
  // Возвращаем результат: ( <img src={countryCodeToFlagSrc(countryCode)} alt={cou….
  return (
    // Рендерим самозакрывающийся элемент img.
    <img
      // Обрабатываем конструкцию: src.
      src={countryCodeToFlagSrc(countryCode)}
      // Обрабатываем конструкцию: alt.
      alt={countryName ?? countryCode}
      // Обрабатываем конструкцию: width.
      width={size}
      // Обрабатываем конструкцию: height.
      height={size}
      // Обрабатываем конструкцию: draggable.
      draggable={false}
      // Обрабатываем конструкцию: style.
      style={{
        // Обрабатываем конструкцию: width.
        width: size,
        // Обрабатываем конструкцию: height.
        height: size,
        // Обрабатываем конструкцию: boxShadow.
        boxShadow:
          // Обрабатываем конструкцию: 0 0 0 1px rgba(0, 255, 136, 0.35), 0 4px 12px rgba(0, 0….
          "0 0 0 1px rgba(0, 255, 136, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4)",
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className="inline-block shrink-0 rounded-full object-cover"
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default CountryFlag;.
export default CountryFlag;
// — разделитель логических блоков —
