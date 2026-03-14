import { useState, useEffect, use } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import { Menu, X, BookOpen, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2.5 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-800">
              Ebookify
            </span>
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                userRole={user?.role || ""}
                onLogout={() => console.log("Logout")}
              />
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition"
                >
                  Login
                </a>

                <a
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="">
          <nav className="">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="">
            {isAuthenticated ? (
              <div className="">
                <div className="">
                  <div className="">
                    <span className="">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="">{user?.name}</div>
                  <div className="">{user?.email}</div>
                </div>
              </div>
            ) : (
              <>
                <a href="/login" className="">
                  Login
                </a>
                <a href="/signup" className="">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg border-t">
          <nav className="flex flex-col p-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="border-t p-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="block w-full text-center py-2 mb-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
