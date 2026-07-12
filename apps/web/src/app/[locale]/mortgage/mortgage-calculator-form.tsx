type MortgageCalculatorFormLabels = {
  propertyPrice: string;
  downPayment: string;
  termYears: string;
  interestRate: string;
  manualRate: string;
};

type MortgageCalculatorFormProps = {
  labels: MortgageCalculatorFormLabels;
  propertyPriceInput: string;
  downPaymentInput: string;
  termYearsInput: string;
  manualRateInput: string;
  selectedRateLabel: string | null;
  downPaymentBelowMinimumHint: string | null;
  onPropertyPriceChange: (value: string) => void;
  onDownPaymentChange: (value: string) => void;
  onTermYearsChange: (value: string) => void;
  onManualRateChange: (value: string) => void;
};

export function MortgageCalculatorForm({
  labels,
  propertyPriceInput,
  downPaymentInput,
  termYearsInput,
  manualRateInput,
  selectedRateLabel,
  downPaymentBelowMinimumHint,
  onPropertyPriceChange,
  onDownPaymentChange,
  onTermYearsChange,
  onManualRateChange,
}: MortgageCalculatorFormProps) {
  return (
    <form className="catalog-mortgage__form" onSubmit={(event) => event.preventDefault()}>
      <label className="catalog-mortgage__field">
        <span>{labels.propertyPrice}</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={propertyPriceInput}
          onChange={(event) => onPropertyPriceChange(event.target.value)}
        />
      </label>

      <label className="catalog-mortgage__field">
        <span>{labels.downPayment}</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={downPaymentInput}
          onChange={(event) => onDownPaymentChange(event.target.value)}
        />
        {downPaymentBelowMinimumHint ? (
          <p className="catalog-mortgage__hint" role="status">
            {downPaymentBelowMinimumHint}
          </p>
        ) : null}
      </label>

      <label className="catalog-mortgage__field">
        <span>{labels.termYears}</span>
        <input
          type="number"
          min={1}
          max={50}
          inputMode="numeric"
          value={termYearsInput}
          onChange={(event) => onTermYearsChange(event.target.value)}
        />
      </label>

      {selectedRateLabel ? (
        <p className="catalog-mortgage__selected-rate">{selectedRateLabel}</p>
      ) : (
        <label className="catalog-mortgage__field">
          <span>{labels.manualRate}</span>
          <input
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            value={manualRateInput}
            onChange={(event) => onManualRateChange(event.target.value)}
          />
        </label>
      )}
    </form>
  );
}
