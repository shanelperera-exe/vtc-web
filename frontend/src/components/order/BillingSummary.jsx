import React from "react";

export default function BillingSummary({ billing }) {
  const address = billing?.address ?? [];
  // billing.payment may be constructed by useOrders; prefer explicit payment.cardType/cardLast4
  const payment = billing?.payment || {};
  // Normalize payment type for display
  const paymentTypeRaw = (payment.type || payment.cardType || '').toString();
  const paymentType = paymentTypeRaw ? paymentTypeRaw : (payment.cardType ? payment.cardType : (payment.type || 'Cash on Delivery'));
  const paymentLast4 = payment.last4 || payment.cardLast4 || '----';
  const paymentExpires = payment.expires || (payment.cardExpMonth && payment.cardExpYear ? `${String(payment.cardExpMonth).padStart(2, '0')} / ${String(payment.cardExpYear).slice(-2)}` : undefined);
  const summary = billing?.summary ?? { subtotal: 0, shipping: 0, tax: 0, total: 0 };
  const format = (v) => (typeof v === 'number' ? `LKR ${v.toLocaleString()}` : v);
  return (
    <section aria-labelledby="summary-heading" className="mt-4">
      <h3 id="summary-heading" className="sr-only">Billing summary</h3>

      <div className="bg-white rounded-xl border border-black/10 shadow-sm p-6 space-y-6">
        {/* Billing Info */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-lg border border-black/10 bg-gray-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Billing address
            </dt>
            <dd className="mt-2 text-gray-900 space-y-1 text-sm">
              {Array.isArray(address) && address.length > 0 ? (
                address.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))
              ) : (
                <p className="text-gray-500 italic">No billing address provided</p>
              )}
            </dd>
          </div>

          <div className="rounded-lg border border-black/10 bg-gray-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Payment information
            </dt>
            <dd className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Card Brand Images */}
              {(() => {
                const raw = (paymentType || '').toLowerCase();
                let brand = raw;
                if (raw.includes('american') || raw.includes('express') || raw === 'amex') brand = 'amex';
                else if (raw.includes('master')) brand = 'mastercard';
                else if (raw.includes('visa')) brand = 'visa';

                const logos = {
                  visa: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg',
                  mastercard: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg',
                  amex: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg',
                };

                const logoSrc = logos[brand] || logos.visa;
                const altText = brand === 'amex' ? 'American Express' : (brand.charAt(0).toUpperCase() + brand.slice(1));

                return (
                  <div className="flex items-center gap-3">
                    <img
                      src={logoSrc}
                      alt={altText}
                      width="44"
                      height="28"
                      className="border border-black/10 bg-white rounded-md p-1"
                      loading="lazy"
                      decoding="async"
                    />
                    <p className="text-gray-900 font-semibold">{paymentType}</p>
                  </div>
                );
              })()}

              {/* Card Details */}
              <div className="text-sm text-gray-700">
                <p>Ending with <span className="font-semibold">{paymentLast4}</span></p>
                {paymentExpires ? (
                  <p>Expires <span className="font-semibold">{paymentExpires}</span></p>
                ) : (
                  <p className="text-gray-500">Expires —</p>
                )}
              </div>
            </dd>
          </div>
        </dl>

        {/* Order Summary */}
        <dl className="rounded-lg border border-black/10 bg-white divide-y divide-gray-100 text-md overflow-hidden">
          <div className="flex justify-between py-3 px-4">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="font-semibold text-gray-900">{format(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between py-3 px-4">
            <dt className="text-gray-600">Shipping</dt>
            <dd className="font-semibold text-gray-900">{format(summary.shipping)}</dd>
          </div>
          <div className="flex justify-between py-3 px-4">
            <dt className="text-gray-600">Tax</dt>
            <dd className="font-semibold text-gray-900">{format(summary.tax)}</dd>
          </div>
          <div className="flex justify-between py-3 px-4 bg-gray-50 text-lg font-bold">
            <dt className="text-gray-900">Order total</dt>
            <dd className="text-gray-900">{format(summary.total)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
