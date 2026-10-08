import type { CountryCode } from "@/assets/flags/countryCodes";
import { cn } from "@/lib/utils";

export type { CountryCode };

const FLAG_URLS = import.meta.glob("/src/assets/flags/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const COUNTRY_NAMES: Partial<Record<CountryCode, string>> = {
  RU: "Россия",
  US: "США",
  WS: "Самоа",
  KZ: "Казахстан",
  BY: "Беларусь",
  DE: "Германия",
  NL: "Нидерланды",
  FI: "Финляндия",
  GB: "Великобритания",
  UA: "Украина",
  FR: "Франция",
  JP: "Япония",
  CN: "Китай",
  PL: "Польша",
  SE: "Швеция",
};

export interface FlagIconProps {
  code: CountryCode;
  className?: string;
}

export default function FlagIcon({ code, className }: FlagIconProps) {
  const url = FLAG_URLS[`/src/assets/flags/${code.toLowerCase()}.svg`];

  if (url === undefined) {
    return null;
  }

  return (
    <img
      src={url}
      alt={COUNTRY_NAMES[code] ?? code}
      draggable={false}
      className={cn(
        "inline-block size-4 shrink-0 rounded-full object-cover",
        className
      )}
    />
  );
}
