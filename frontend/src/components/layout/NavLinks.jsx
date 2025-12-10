import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiInfo, FiMail, FiHelpCircle } from 'react-icons/fi';

const NavLinks = () => {
  const closeTimeout = useRef();
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative mx-auto flex w-fit bg-white p-1"
    >

    <Tab setPosition={setPosition}>
  <a href="/about" className="text-white font-medium text-lg flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
    <FiInfo className="w-5 h-5" aria-hidden="true" />
    <span>About Us</span>
  </a>
    </Tab>
    <Tab setPosition={setPosition}>
  <a href="/contact" className="text-white font-medium text-lg flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
    <FiMail className="w-5 h-5" aria-hidden="true" />
    <span>Contact Us</span>
  </a>
    </Tab>
    <Tab setPosition={setPosition}>
  <a href="/help" className="text-white font-medium text-lg flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
    <FiHelpCircle className="w-5 h-5" aria-hidden="true" />
    <span>Help</span>
  </a>
    </Tab>


      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition, onMouseEnter, onMouseLeave }) => {
  const ref = useRef(null);

  const handleMouseEnter = (e) => {
    if (onMouseEnter) onMouseEnter(e);
    if (!ref?.current) return;
    const { width } = ref.current.getBoundingClientRect();
    setPosition({
      left: ref.current.offsetLeft,
      width,
      opacity: 1,
    });
  };

  return (
    <li
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-8 bg-black md:h-10 rounded-full pointer-events-none"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    />
  );
};

export default NavLinks;