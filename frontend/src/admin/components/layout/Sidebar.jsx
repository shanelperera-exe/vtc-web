import React, { useState } from "react";
import {
    FiBarChart,
    FiChevronDown,
    FiChevronsRight,
    FiDollarSign,
    FiHome,
    FiMonitor,
    FiShoppingCart,
    FiBox,
    FiTag,
    FiUsers,
    FiSettings,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("Dashboard");
    const [isTransitioning, setIsTransitioning] = useState(false);

    return (
        <nav
            className={`h-screen shrink-0 p-2.5 shadow-lg border-r-2 flex flex-col overflow-hidden 
                fixed top-0 left-0 z-50
                ${open ? "w-64 items-start" : "w-[75px] items-center"}
                bg-[#0bd964] bg-opacity-100 opacity-100`}
        >
            <TitleSection open={open} />

            <div className="space-y-3 w-full flex flex-col items-center">
                <Option
                    Icon={FiHome}
                    title="Dashboard"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiDollarSign}
                    title="Sales"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                    notifs={3}
                />
                <Option
                    Icon={FiMonitor}
                    title="View Site"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiBox}
                    title="Orders"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />

                <Option
                    Icon={FiShoppingCart}
                    title="Products"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiTag}
                    title="Categories"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiBarChart}
                    title="Analytics"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiUsers}
                    title="Users"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
                <Option
                    Icon={FiSettings}
                    title="Settings"
                    selected={selected}
                    setSelected={setSelected}
                    open={open}
                    isTransitioning={isTransitioning}
                />
            </div>

            <ToggleClose open={open} setOpen={setOpen} setIsTransitioning={setIsTransitioning} />
    </nav>
    );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs, isTransitioning }) => {
    const routeMap = {
        Dashboard: "/admin/dashboard",
        Sales: "/admin/sales",
        "View Site": "/",
        Orders: "/admin/orders",
        Products: "/admin/products",
        Categories: "/admin/categories",
        Analytics: "/admin/analytics",
        Users: "/admin/users",
        Settings: "/admin/settings",
    };
    const to = routeMap[title] || "/admin";
    // For "View Site", force a full document reload so the main (user) app mounts and renders home
    const shouldReload = title === "View Site" && to === "/";
    return (
    <div className="relative group w-full flex justify-center">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
            >
                <NavLink
                    to={to}
                    reloadDocument={shouldReload}
                    target={shouldReload ? "_self" : undefined}
                    onClick={() => setSelected(title)}
                    className={({ isActive }) => (
                            open
                                ? `flex h-12 w-full items-center gap-2 border-2 border-black hover:border-black px-2 transition-colors rounded-xl ${isActive || selected === title ? "bg-black text-green-400" : "bg-[#23f47d] text-black"}`
                                : `grid h-12 w-12 place-content-center border-2 border-black hover:border-black text-2xl transition-colors rounded-xl ${isActive || selected === title ? "bg-black text-green-400" : "bg-[#23f47d] text-black"}`
                    )}
                >
                    <div className={`grid place-content-center ${open ? "h-6 w-6 text-2xl" : ""}`}>
                        <Icon />
                    </div>
                    {open && (
                        <span className="text-xs font-medium">
                            {title}
                        </span>
                    )}
                </NavLink>

                {notifs && !isTransitioning && (
                    <span className={`absolute ${open ? "right-2 top-1/2 -translate-y-1/2" : "-right-1 -top-1"} size-4 bg-white border-2 border-black text-[10px] leading-4 text-black grid place-content-center`}>
                        {notifs}
                    </span>
                )}
            </motion.div>

            {/* Tooltip when collapsed
            {!open && (
                <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {title}
                </span>
            )} */}
        </div>
    );
};

const TitleSection = ({ open }) => {
    return (
        <div className="mb-3 pb-1 w-full">
            <div className={`flex cursor-pointer items-center rounded-md ${open ? "justify-between px-1" : "justify-center w-full"}`}>
                <div className="flex items-center gap-2">
                    <Logo />
                    {open && (
                        <div>
                            <span className="block text-xs font-semibold text-black">Vidara Trade Center</span>
                            <span className="block text-xs text-black/70">Web</span>
                        </div>
                    )}
                </div>
                {open && <FiChevronDown className="mr-2 text-black" />}
            </div>
            <hr className="mt-3 mb-1 w-full border-t border-black/30" />
        </div>
    );
};

const Logo = () => {
    // Temp logo from https://logoipsum.com/
    return (
        <div className="grid size-12 shrink-0 place-content-center rounded-md bg-black mt-1">
            <svg
                width="24"
                height="24"
                viewBox="0 0 50 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-green-400"
            >
                <path
                    d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
                    stopColor="#000000"
                ></path>
                <path
                    d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
                    stopColor="#000000"
                ></path>
            </svg>
        </div>
    );
};

const ToggleClose = ({ open, setOpen, setIsTransitioning }) => {
    return (
        <button
            onClick={() => {
                setIsTransitioning && setIsTransitioning(true);
                setOpen((pv) => !pv);
                // Match this duration to your motion layout transition if customized
                setTimeout(() => setIsTransitioning && setIsTransitioning(false), 300);
            }}
            className="absolute bottom-0 left-0 right-0 transition-colors hover:bg-[#23f47d] text-black"
        >
            <div className="flex items-center p-2">
                <div className="grid size-12 place-content-center text-2xl">
                    <FiChevronsRight className={`transition-transform ${open && "rotate-180"}`} />
                </div>
                {open && (
                    <span className="text-xs font-medium">Hide</span>
                )}
            </div>
        </button>
    );
};

export default Sidebar;
