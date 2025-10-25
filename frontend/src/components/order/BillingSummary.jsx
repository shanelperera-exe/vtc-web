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
      <div className="bg-white shadow border-3 p-6 space-y-8">
        {/* Billing Info */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-700">
              Billing address
            </dt>
            <dd className="mt-2 text-gray-900 space-y-1 text-sm">
              {address.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-700">
              Payment information
            </dt>
            <dd className="mt-2 flex items-center gap-4">
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
                  <div className="flex items-center gap-2">
                    <img
                      src={logoSrc}
                      alt={altText}
                      width="40"
                      height="24"
                      className='border-2'
                    />
                    <p className="text-gray-900 font-medium ml-2">{payment.type}</p>
                  </div>
                );
              })()}

              {/* Card Details */}
              <div className="text-sm text-gray-600">
                  <p>Ending with {paymentLast4}</p>
                  <p>Expires {paymentExpires}</p>
              </div>
            </dd>
          </div>
        </dl>

        {/* Order Summary */}
        <dl className="divide-y divide-gray-200 text-md">
          <div className="flex justify-between py-2">
            <dt className="text-gray-600">Subtotal</dt>
            <dd className="font-medium text-gray-900">{format(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-600">Shipping</dt>
            <dd className="font-medium text-gray-900">{format(summary.shipping)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-600">Tax</dt>
            <dd className="font-medium text-gray-900">{format(summary.tax)}</dd>
          </div>
          <div className="flex justify-between py-3 text-lg font-semibold">
            <dt className="text-gray-900">Order total</dt>
            <dd className="text-gray-900">{format(summary.total)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
