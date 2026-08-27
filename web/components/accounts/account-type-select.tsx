import { AccountType } from "@prisma/client";

import { ACCOUNT_TYPE_CONFIGURATIONS } from "@/lib/accounts/account-types";

export function AccountTypeSelect({
  value,
  onChange,
  disabled,
}: {
  value: AccountType;
  onChange: (value: AccountType) => void;
  disabled?: boolean;
}) {
  const config = ACCOUNT_TYPE_CONFIGURATIONS[value];
  return (
    <label>
      Tipo
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as AccountType)}
      >
        {Object.values(ACCOUNT_TYPE_CONFIGURATIONS).map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {config && <span className="field-note">{config.description}</span>}
    </label>
  );
}
