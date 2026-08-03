export type PriceValue = number | string | { toString(): string };

export const toPriceNumber = (price: PriceValue) => Number(price.toString());

export const formatPrice = (price: PriceValue) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(toPriceNumber(price));
};
