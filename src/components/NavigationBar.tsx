import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const NavigationBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollNavItems = ["Features", "Styles", "Mathematics"];
  const pageNavItems = [
    { label: "Canvas", path: "/canvas" },
    { label: "Generator", path: "/generator" },
    { label: "Explore", path: "/explore" },
  ];

  const scrollToSection = (id: string) => {
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById(id.toLowerCase())
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return;
    }
    document
      .getElementById(id.toLowerCase())
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome ? "glass-strong shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span
              className="text-xl font-bold gradient-text"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              KolamCraft
            </span>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center gap-1">
          {isHome &&
            scrollNavItems.map((item, i) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => scrollToSection(item)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {item}
              </motion.button>
            ))}

          {pageNavItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (scrollNavItems.length + i) * 0.1 }}
            >
              <Link
                to={item.path}
                className={`px-4 py-2 text-sm transition-colors rounded-lg hover:bg-primary/5 ${
                  location.pathname === item.path
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile hamburger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden w-9 h-9 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="hidden md:flex items-center gap-2"
        >
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.div>
          </motion.button>

          {/* Login */}
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Login
            </motion.button>
          </Link>

          <Link to="/canvas">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all box-glow"
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </div>
      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-strong border-t border-border px-6 py-4 flex flex-col gap-1"
          >
            {isHome &&
              scrollNavItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                >
                  {item}
                </button>
              ))}
            {pageNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-xl text-sm transition-colors hover:bg-primary/8 ${
                  location.pathname === item.path
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border mt-1">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <Link to="/login" className="ml-auto">
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-all">
                  <LogIn className="w-4 h-4" /> Login
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationBar;
