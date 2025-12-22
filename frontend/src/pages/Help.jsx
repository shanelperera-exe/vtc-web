import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const faqs = [
  {
    question: "What is Vidara Trade Center?",
    answer: `Vidara Trade Center is a retail store offering a wide range of products including cleaning items, kitchenware, plastic goods, homeware, and electrical items. Our online store allows customers to browse and purchase these items conveniently from anywhere in Sri Lanka.`,
  },
  {
    question: "How can I place an order?",
    answer: `To place an order, simply browse through our categories, add items to your cart, and proceed to checkout. You can review your order and confirm your details before completing your purchase.`,
  },
  {
    question: "What payment methods do you accept?",
    answer: `We currently support both Cash on Delivery (COD) and online card payments (VISA, MASTER, AMEX)`,
  },
  {
    question: "Do you offer delivery services?",
    answer: `Yes! We deliver across Sri Lanka. Delivery charges may vary depending on your location and the total order weight. You’ll see the delivery details during checkout.`,
  },
  {
    question: "Can I pick up my order from the store?",
    answer: `Yes. You can choose the "Store Pickup" option during checkout and collect your items directly from our store during business hours.`,
  },
  {
    question: "How long does delivery take?",
    answer: `Orders within Colombo are typically delivered within 1–2 business days. For other regions, delivery may take 3–5 business days depending on courier availability.`,
  },
  {
    question: "Can I return or exchange a product?",
    answer: `Yes. If you receive a defective or incorrect item, please contact us within 7 days of delivery. Products must be unused and in their original packaging for a return or exchange.`,
  },
  {
    question: "Do I need an account to make a purchase?",
    answer: `You can check out as a guest, but creating an account allows you to track your orders, save your delivery information, and receive updates on offers and new products.`,
  },
  {
    question: "How can I track my order?",
    answer: `Once your order is confirmed, you’ll receive an order number and email updates. You can also log into your account and view the status of your order under 'My Orders'.`,
  },
  {
    question: "What should I do if I encounter a problem with my order?",
    answer: `If you face any issue with your order — such as missing items, damaged products, or delays — please contact our support team through the 'Contact Us' page or email us at support@vidaratradecenter.lk.`,
  },
  {
    question: "Do you have a physical store?",
    answer: `Yes, Vidara Trade Center operates a physical store in Hendala, Wattala. You can visit us during regular business hours for in-person shopping.`,
  },
  {
    question: "Are the prices the same online and in-store?",
    answer: `Generally, our online and in-store prices are the same. However, some promotions or discounts may be exclusive to either our physical store or our website.`,
  },
  {
    question: "Do you offer wholesale or bulk discounts?",
    answer: `Yes, we provide special rates for bulk orders. Please contact us via email or through our contact form for wholesale inquiries.`,
  },
  {
    question: "How do I contact customer service?",
    answer: `You can reach us through the Contact page on our website, by calling our hotline, or by emailing support@vidaratradecenter.lk. Our team is available Monday–Saturday, 9 AM to 6 PM.`,
  },
  {
    question: "Can I cancel my order after placing it?",
    answer: `You can cancel your order within 2 hours of placing it, provided it has not yet been processed or shipped. Please contact us immediately for assistance.`,
  },
  {
    question: "Are my personal details secure?",
    answer: `Yes, your personal data is safely stored and used only for processing your orders. We use industry-standard encryption and never share your data with third parties.`,
  },
  {
    question: "Do you restock sold-out products?",
    answer: `Yes, we regularly restock popular products. You can click the “Notify Me” button on a sold-out product page to receive an email when it’s available again.`,
  },
  {
    question: "Do you have seasonal discounts or offers?",
    answer: `Yes! We offer discounts during special occasions like Sinhala & Tamil New Year, Christmas, and other seasonal sales. Follow us on social media or subscribe to our newsletter to stay updated.`,
  },
];


export default function Help() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto min-h-screen max-w-5xl px-6 py-24 text-base md:text-lg">
      <h1 className="mb-6 text-center text-6xl font-bold">FAQs</h1>

      {faqs.map((faq, i) => (
        <div key={i} className="mb-4 border-2 border-neutral-950 px-4 rounded-2xl">
          <button onClick={() => toggle(i)} className="flex w-full items-center justify-between gap-4 py-6">
            <span className={`text-left text-lg font-medium md:text-2xl ${openIndex === i ? 'text-emerald-600' : 'text-neutral-900'}`}>
              {faq.question}
            </span>
            <motion.span
              style={{ color: 'rgb(3, 6, 23)' }}
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="text-xl md:text-3xl" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                className="overflow-hidden text-neutral-600"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="pb-4 whitespace-pre-line">{faq.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      </div>
    </>
  )
}
