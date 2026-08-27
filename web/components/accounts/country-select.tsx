import { getCountryOptions } from "@/lib/countries";

export function CountrySelect({
  value,
  onChange,
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      País{required && " *"}
      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecione o país</option>
        {getCountryOptions().map((country) => (
          <option value={country.value} key={country.value}>
            {country.label} — {country.value}
          </option>
        ))}
      </select>
    </label>
  );
}
