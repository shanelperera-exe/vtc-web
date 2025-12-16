import React from "react";
import Sidebar from "./components/layout/Sidebar";
import AdminTopBar from "./components/layout/AdminTopBar";
import { Outlet } from "react-router-dom";

const AdminPanel = () => {
  return (
    <div className="w-full max-w-full">
      <div className="admin-dashboard min-h-screen flex w-full min-w-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 px-2 pl-[75px]">
          <AdminTopBar />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
