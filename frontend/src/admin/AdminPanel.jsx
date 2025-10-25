import React from "react";
import Sidebar from "./components/layout/Sidebar";
import AdminTopBar from "./components/layout/AdminTopBar";
import { Outlet } from "react-router-dom";

const AdminPanel = () => {
  return (
    <div className="admin-dashboard w-full min-h-screen flex">
      <Sidebar />
      <div className="flex flex-col flex-1 px-2 pl-[75px]">
        <AdminTopBar />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel;
