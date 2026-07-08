# Calculator Rules

## Purpose

Calculator gives an estimated monthly payment based on buyer inputs and selected BankOffer.

It is not a bank approval engine.

## Inputs

Required v1 inputs:

- property_price;
- down_payment_percent or down_payment_amount;
- loan_term_years;
- selected_bank_offer_id.

## Offer Fields Used

From BankOffer:

- rate;
- APR optional;
- min_down_payment_percent;
- term_options_years;
- fees optional;
- calculation_notes optional.

## Validation

Rules:

- property_price must be positive;
- down payment must be >= selected offer minimum;
- loan term must be one of selected offer terms;
- rate must be present for calculation.

If input is invalid:

- show validation message;
- do not show misleading monthly result.

## Basic Calculation

Recommended v1 formula:

```text
loan_amount = property_price - down_payment_amount
monthly_rate = annual_rate / 12
number_of_payments = loan_term_years * 12
monthly_payment = loan_amount * monthly_rate * (1 + monthly_rate)^number_of_payments / ((1 + monthly_rate)^number_of_payments - 1)
```

If rate is 0:

```text
monthly_payment = loan_amount / number_of_payments
```

## Down Payment

User can adjust down payment by percent or amount.

System should keep both in sync:

```text
down_payment_amount = property_price * down_payment_percent / 100
```

## Term Options

Offer can define allowed term options.

Example:

```text
15
20
30
```

If selected bank does not support current term, choose nearest/default term and show clear UI update.

## Result Display

Show:

- estimated monthly payment;
- loan amount;
- selected bank;
- selected rate;
- selected term;
- down payment.

Optional:

- total interest;
- total payment.

## Estimate Disclaimer

Display a short note that values are estimates and final terms depend on bank approval.

## No Persistence Required

v1 calculator does not need to save buyer calculations.

Analytics can later track aggregate page/offer interactions if needed.

