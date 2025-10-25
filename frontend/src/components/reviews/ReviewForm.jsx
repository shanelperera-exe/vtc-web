import React, { useState, useRef } from 'react';
import { FiUpload, FiImage, FiX, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StarReviewInput from '../ui/StarReviewInput';


export default function ReviewForm({ productId = null, onCancel = () => { }, onSubmit = () => { } }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [ytUrl, setYtUrl] = useState('');
  const [name, setName] = useState('');
  const [nameFormat, setNameFormat] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const fileRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!rating) e.rating = 'Please choose a rating.';
    if (!title.trim()) e.title = 'Please add a short title.';
    if (!body.trim()) e.body = 'Write a review comment.';
    if (!email.trim()) e.email = 'Email is required (kept private).';
    // quick email pattern
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a valid email.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = (ev) => {
    // Only keep image files
    const files = Array.from(ev.target.files || []).filter((f) => {
      if (!f || !f.type) return false;
      return f.type.startsWith('image/');
    });
    setMediaFiles(files.slice(0, 5));
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // prepare payload — caller handles upload/submission
    const payload = {
      productId,
      rating,
      title,
      body,
      mediaFiles,
      ytUrl,
      name,
      nameFormat,
      email,
    };
    onSubmit(payload);
  };

  return (
    <form className="w-full bg-white p-6 rounded-none" onSubmit={submit} noValidate>
      <div className="text-4xl font-semibold mb-4">Write a review</div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="mt-1 overflow-hidden">
          <StarReviewInput rating={rating} hover={hover} onChange={(v) => setRating(v)} onHover={(v) => setHover(v)} />
          {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="review-title">Review Title</label>
        <input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Give your review a title" className="mt-1 block w-full rounded-none border border-gray-300 bg-white px-3 py-2 placeholder:text-sm focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63]" />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="review-body">Review</label>
        <textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Write your comments here" className="mt-1 block w-full rounded-none border border-gray-300 bg-white px-3 py-2 placeholder:text-sm focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63]" />
        {errors.body && <p className="text-sm text-red-600 mt-1">{errors.body}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Picture (optional)</label>

        {/* hidden file input triggered by a styled button */}
        <input
          ref={fileRef}
          onChange={handleFiles}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-hidden="true"
        />

        <div className="mt-2">
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-none bg-white text-sm text-gray-700 hover:bg-gray-50"
            aria-label="Attach pictures or videos"
          >
            <FiUpload className="w-4 h-4" />
            Attach files
          </button>
        </div>

        {mediaFiles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mediaFiles.map((f, i) => (
              <div key={i} className="flex items-center text-xs text-gray-700 px-2 py-1 bg-gray-100 border border-gray-200 rounded-none">
                <FiImage className="w-4 h-4 mr-2 text-gray-600" />
                <span className="truncate mr-2">{f.name}</span>
                <button
                  type="button"
                  aria-label={`Remove file ${f.name}`}
                  onClick={() => setMediaFiles((cur) => cur.filter((_, idx) => idx !== i))}
                  className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-800"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="yt-url">YouTube URL (optional)</label>
        <input id="yt-url" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} type="url" placeholder="YouTube URL" className="mt-1 block w-full rounded-none border border-gray-300 bg-white px-3 py-2 placeholder:text-sm focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="reviewer-name">Name</label>
          <input id="reviewer-name" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Enter your name (public)" className="mt-1 block w-full rounded-none border border-gray-300 bg-white px-3 py-2 placeholder:text-sm focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="name-format">Displayed publicly like</label>
          <div className="mt-1">
            <NameFormatDropdown value={nameFormat || 'John Smith'} onChange={(v) => setNameFormat(v)} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="reviewer-email">Email</label>
        <input id="reviewer-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email (private)" className="mt-1 block w-full rounded-none border border-gray-300 bg-white px-3 py-2 placeholder:text-sm focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63]" />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>How we use your data: We’ll only contact you about the review you left, and only if necessary. By submitting your review, you agree to our <a className="text-blue-600 underline" href="#" target="_blank" rel="noreferrer">terms</a> and <a className="text-blue-600 underline" href="#" target="_blank" rel="noreferrer">privacy</a> policy.</p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border-2 border-black rounded-none text-black bg-white hover:bg-gray-50">Cancel review</button>
        <button type="submit" className="px-4 py-2 text-sm border-2 border-black bg-[#00bf63] font-medium text-black hover:bg-black hover:text-white">Submit Review</button>
      </div>
    </form>
  );
}


// Name format dropdown (motion + icons)
const Option = ({ text, onClick }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={onClick}
      className="w-full px-2 py-1 text-sm font-medium whitespace-nowrap text-slate-700 transition-colors cursor-pointer hover:bg-gray-100 hover:text-black border-b last:border-b-0 border-gray-200"
    >
      <span>{text}</span>
    </motion.li>
  );
};

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.06,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
    },
  },
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      when: 'afterChildren',
    },
  },
};

// actionIconVariants removed since dropdown options no longer show icons

const NameFormatDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options = [
    { label: 'John Smith' },
    { label: 'John S.' },
    { label: 'John' },
    { label: 'J.S.' },
    { label: 'Anonymous' },
  ];

  return (
    <div className="relative">
      <motion.div animate={open ? 'open' : 'closed'} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          type="button"
          className="flex items-center gap-2 px-3 text-gray-700 bg-white border border-gray-300 w-full justify-between rounded-none focus:outline-none focus:border-[#00bf63] focus:ring-1 focus:ring-[#00bf63] h-10"
        >
          <span className="text-sm leading-10">{value}</span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: 'top' }}
          className="flex flex-col gap-0 p-1 bg-white shadow-xl absolute top-[110%] left-0 w-full border-2 border-gray-300 overflow-hidden z-50"
        >
          {options.map((opt) => (
            <Option key={opt.label} text={opt.label} onClick={() => { onChange(opt.label); setOpen(false); }} />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

