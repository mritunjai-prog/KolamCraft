import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => (
  <footer className="relative py-20 px-6 border-t border-border/50">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-serif font-bold gradient-text">
            KolamCraft
          </span>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Team Dots To Innovation — SIH 2025 — Sir Padampat Singhania University
        </p>

        <Link to="/canvas">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium box-glow"
          >
            Launch Canvas →
          </motion.button>
        </Link>
      </div>
    </div>
  </footer>
);

export default FooterSection;
