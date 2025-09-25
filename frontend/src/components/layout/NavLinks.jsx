import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

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
  <a href="/docs" className="text-white font-bold lowercase text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>about</a>
      </Tab>
      <Tab setPosition={setPosition}>
  <a href="/blog" className="text-white font-bold lowercase text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>contact</a>
      </Tab>
      <Tab setPosition={setPosition}>
  <a href="/blog" className="text-white font-bold lowercase text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>help</a>
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
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
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
      className="absolute z-0 h-8 bg-black md:h-10"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    />
  );
};

export default NavLinks;