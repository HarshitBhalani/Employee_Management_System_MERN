import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full bg-[#1e40af] shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-2">
        <NavLink to="/" className="text-2xl sm:text-3xl font-bold text-white tracking-tight hover:text-[#3b82f6] transition-colors">
          Employee Management System
        </NavLink>
        <NavLink
          className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 border border-white bg-[#1e40af] hover:bg-[#3b82f6] hover:text-white text-white h-10 rounded-lg px-5 shadow-sm"
          to="/create"
        >
          + Create Employee
        </NavLink>
      </nav>
    </header>
  );
}