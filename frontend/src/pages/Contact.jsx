import { useEffect, useState, cloneElement } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Store, ExternalLink } from 'lucide-react'

export default function Contact() {
	const lat = 6.996062
	const lng = 79.884053
	const placeName = 'Vidara Trade Center'
	const addressText = '353, Kerawalapitiya, Hendala, Wattala'
	const placeQuery = encodeURIComponent(`${placeName}, ${addressText}`)
	const googleMapsUrl = `https://www.google.com/maps?q=${placeQuery}`
	// Robust embed handling: use the provided official Google Maps embed for the new location, then fall back to OSM
	const primaryEmbedSrc = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15840.448919226443!2d79.884053!3d6.996062!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2f7004d710d0f%3A0xea33710f75ad4d5d!2sVidara%20Trade%20Center!5e0!3m2!1sen!2sus!4v1761243083023!5m2!1sen!2sus'
	const fallbackEmbedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`
	const [mapLoaded, setMapLoaded] = useState(false)
	const [useFallback, setUseFallback] = useState(false)

	useEffect(() => {
		const t = setTimeout(() => {
			if (!mapLoaded) setUseFallback(true)
		}, 4000)
		return () => clearTimeout(t)
	}, [mapLoaded])

	return (
		<section id="contact" className="min-h-[60vh] bg-gradient-to-b from-white to-slate-50/70">
			<div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
				{/* Heading */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-8 md:mb-12"
				>
					<h1 className="text-3xl md:text-6xl font-semibold tracking-tight text-slate-900">Contact Us</h1>
					<p className="mt-2 text-slate-600">We’d love to hear from you. Visit us or reach out via phone or email.</p>
				</motion.div>

				{/* Contact Form */}
				<ContactForm />

				<div className="grid md:grid-cols-2 gap-10 items-start">
					{/* Contact info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="bg-white shadow-md ring-1 ring-slate-200 p-8"
					>
						<h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
							<Store className="text-emerald-600 w-6 h-6" /> Visit Us
						</h2>
						<p className="text-slate-600 mb-6">Find us or contact us through the details below.</p>

						<dl className="space-y-6">
							<ContactItem icon={<MapPin />} title="Address" text="353, Kerawalapitiya, Hendala, Wattala" />
							<ContactItem icon={<Phone />} title="Phone" link="tel:+94771234567" text="+94 77 123 4567" />
							<ContactItem icon={<Mail />} title="Email" link="mailto:contact@vidaratradecenter.com" text="contact@vidaratradecenter.com" />
							<div className="mt-4 text-sm text-slate-600">
								<strong className="text-slate-800">Opening Hours</strong>
								<ul className="mt-1 space-y-0.5">
									<li>Mon – Fri: 9:00 AM – 6:00 PM</li>
									<li>Saturday: 9:00 AM – 4:00 PM</li>
									<li>Sunday: Closed</li>
								</ul>
							</div>
						</dl>
					</motion.div>

					{/* Embedded Google Map */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.6 }}
						className="relative overflow-hidden shadow-xl ring-1 ring-black/5 bg-white p-6 flex flex-col items-center justify-center text-center"
					>
						<div className="w-full">
							<iframe
								title="Vidara Trade Center location map"
								className="block w-full h-72 sm:h-80 md:h-[420px]"
								src={useFallback ? fallbackEmbedSrc : primaryEmbedSrc}
								onLoad={() => setMapLoaded(true)}
								onError={() => setUseFallback(true)}
								loading="lazy"
								style={{ border: 0 }}
								allowFullScreen
								referrerPolicy="no-referrer-when-downgrade"
							/>

							<div className="mt-4 flex flex-wrap gap-3">
								<a
									href={googleMapsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm hover:bg-emerald-700 focus:outline-none"
								>
									Open in Google Maps
									<ExternalLink className="w-4 h-4" />
								</a>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

function ContactForm() {
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [error, setError] = useState('')

	const onChange = (e) => {
		const { name, value } = e.target
		setForm((f) => ({ ...f, [name]: value }))
	}

	const onSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError('')
		try {
			// Placeholder: integrate with your backend endpoint when available
			await new Promise((res) => setTimeout(res, 600))
			setSubmitted(true)
		} catch (err) {
			setError('Something went wrong. Please try again later.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (submitted) {
		return (
			<div className="mb-8 md:mb-10 bg-white shadow-sm ring-1 ring-black/5 p-6 md:p-8">
					<p className="text-emerald-700 font-medium">Thanks! Your message has been sent. We’ll get back to you soon.</p>
			</div>
		)
	}

	const inputClass = 'mt-1 block w-full border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

	return (
		<form onSubmit={onSubmit} className="mb-8 md:mb-10 bg-white shadow-sm ring-1 ring-black/5 p-6 md:p-8" noValidate>
			<h2 className="text-2xl font-semibold text-slate-900">Send us a message</h2>
			<p className="mt-1 text-sm text-slate-600">We typically respond within 1–2 business days.</p>

			<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label htmlFor="firstName" className="text-sm font-medium text-slate-700">First name</label>
					<input id="firstName" name="firstName" value={form.firstName} onChange={onChange} className={inputClass} autoComplete="given-name" required />
				</div>
				<div>
					<label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last name</label>
					<input id="lastName" name="lastName" value={form.lastName} onChange={onChange} className={inputClass} autoComplete="family-name" required />
				</div>
				<div>
					<label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
					<input id="email" name="email" type="email" value={form.email} onChange={onChange} className={inputClass} autoComplete="email" required />
				</div>
				<div>
					<label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone (optional)</label>
					<input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} className={inputClass} autoComplete="tel" />
				</div>
				<div className="md:col-span-2">
					<label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
					<input id="subject" name="subject" value={form.subject} onChange={onChange} className={inputClass} required />
				</div>
				<div className="md:col-span-2">
					<label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
					<textarea id="message" name="message" rows={5} value={form.message} onChange={onChange} className={inputClass} required />
				</div>
			</div>

			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}

			<div className="mt-6">
				<button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50">
					{isSubmitting ? 'Sending…' : 'Submit'}
				</button>
			</div>
		</form>
	)
}

function ContactItem({ icon, title, text, link }) {
	const IconEl = icon ? cloneElement(icon, { className: 'w-5 h-5 text-emerald-600' }) : null
	return (
		<div className="flex gap-3">
			<dt className="mt-1">{IconEl}</dt>
			<dd className="text-slate-700">
				<p className="font-medium text-slate-900">{title}</p>
				{link ? (
					<a
						href={link}
						className="text-sm text-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
					>
						{text}
					</a>
				) : (
					<p className="text-sm">{text}</p>
				)}
			</dd>
		</div>
	)
}

