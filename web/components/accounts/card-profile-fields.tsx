import { CardType } from "@prisma/client";

export type CardForm = {
  type: CardType;
  brand: string;
  lastFour: string;
  closingDay: string;
  dueDay: string;
  creditLimit: string;
  limitAssetId: string;
};

const labels: Record<CardType, string> = {
  CREDIT: "Crédito",
  DEBIT: "Débito",
  PREPAID: "Pré-pago",
  BENEFIT: "Benefício",
  GIFT: "Gift card",
  VIRTUAL: "Virtual",
};

export function CardProfileFields({
  value,
  onChange,
  types,
  assets,
}: {
  value: CardForm;
  onChange: (value: CardForm) => void;
  types: CardType[];
  assets: Array<{ id: string; code: string }>;
}) {
  const set = (key: keyof CardForm, next: string) =>
    onChange({ ...value, [key]: next });
  const noCycle = types.every((type) =>
    (
      [
        CardType.GIFT,
        CardType.BENEFIT,
        CardType.PREPAID,
        CardType.VIRTUAL,
      ] as CardType[]
    ).includes(type),
  );
  return (
    <div className="card-fields">
      <div className="form-two">
        <label>
          Tipo de cartão
          <select
            value={value.type}
            onChange={(event) => set("type", event.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {labels[type]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bandeira
          <input
            value={value.brand}
            onChange={(event) => set("brand", event.target.value)}
            placeholder="Visa, Elo..."
          />
        </label>
      </div>
      <div className="form-two">
        <label>
          Últimos quatro dígitos
          <input
            inputMode="numeric"
            maxLength={4}
            value={value.lastFour}
            onChange={(event) => set("lastFour", event.target.value)}
            placeholder="Opcional"
          />
        </label>
        {!noCycle && (
          <label>
            Dia de fechamento
            <input
              type="number"
              min="1"
              max="31"
              value={value.closingDay}
              onChange={(event) => set("closingDay", event.target.value)}
            />
          </label>
        )}
      </div>
      {!noCycle && (
        <div className="form-two">
          <label>
            Dia de vencimento
            <input
              type="number"
              min="1"
              max="31"
              value={value.dueDay}
              onChange={(event) => set("dueDay", event.target.value)}
            />
          </label>
          <label>
            Limite
            <input
              inputMode="decimal"
              value={value.creditLimit}
              onChange={(event) => set("creditLimit", event.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
      )}
      {value.creditLimit && (
        <label>
          Ativo do limite
          <select
            required
            value={value.limitAssetId}
            onChange={(event) => set("limitAssetId", event.target.value)}
          >
            <option value="">Selecione</option>
            {assets.map((asset) => (
              <option value={asset.id} key={asset.id}>
                {asset.code}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className="field-note">
        Nunca informe número completo do cartão ou CVV.
      </span>
    </div>
  );
}
