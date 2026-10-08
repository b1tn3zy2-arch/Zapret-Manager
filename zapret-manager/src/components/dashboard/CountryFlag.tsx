import { countryCodeToFlagSrc } from "@/lib/geo";

export interface CountryFlagProps {
  countryCode: string;
  countryName?: string | undefined;
  size?: number;
}

function CountryFlag({
  countryCode,
  countryName,
  size = 32,
}: CountryFlagProps) {
  return (
    <img
      src={countryCodeToFlagSrc(countryCode)}
      alt={countryName ?? countryCode}
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 0 0 1px rgba(0, 255, 136, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
      className="inline-block shrink-0 rounded-full object-cover"
    />
  );
}

export default CountryFlag;
