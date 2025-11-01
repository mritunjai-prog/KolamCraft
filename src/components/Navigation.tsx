import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  Palette,
  Home,
  PlusCircle,
  Compass,
} from "lucide-react"; // Removed Zap icon

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug logging
  React.useEffect(() => {
    console.log("Navigation - isAuthenticated:", isAuthenticated);
    console.log("Navigation - user:", user);
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      path: "/canvas",
      label: "Create",
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      path: "/explore",
      label: "Explore",
      icon: <Compass className="w-4 h-4" />,
    },
  ];
  // Handler for Learn button
  const handleLearnClick = () => {
    window.open(
      "https://zen-kolam.vercel.app/?size=9&duration=7500&initial-auto-animate=false",
      "_blank"
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">KolamCraft</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, idx) => (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                {/* Insert Learn button right after Explore */}
                {item.label === "Explore" && (
                  <button
                    onClick={handleLearnClick}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    style={{ fontSize: "1rem", cursor: "pointer" }}
                  >
                    <span role="img" aria-label="Learn">
                      📖
                    </span>
                    <span>Learn</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
