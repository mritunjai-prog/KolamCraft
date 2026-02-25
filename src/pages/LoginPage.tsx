import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

/* ── Floating kolam ring SVG ── */
const KolamRing = ({
  size,
  opacity,
  delay,
  duration,
  className = "",
}: {
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  className?: string;
}) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    className={`absolute ${className}`}
    style={{ opacity }}
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear", delay }}
  >
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeDasharray="6 4"
      className="text-primary/30"
    />
    <circle
      cx="100"
      cy="100"
      r="70"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      strokeDasharray="3 6"
      className="text-primary/20"
    />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 100 + 70 * Math.cos(rad);
      const y1 = 100 + 70 * Math.sin(rad);
      const x2 = 100 + 90 * Math.cos(rad + Math.PI / 8);
      const y2 = 100 + 90 * Math.sin(rad + Math.PI / 8);
      return (
        <line
          key={angle}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-primary/25"
        />
      );
    })}
    {[0, 60, 120, 180, 240, 300].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const x = 100 + 80 * Math.cos(rad);
      const y = 100 + 80 * Math.sin(rad);
      return (
        <circle
          key={angle}
          cx={x}
          cy={y}
          r="3"
          fill="currentColor"
          className="text-primary/40"
        />
      );
    })}
  </motion.svg>
);

/* ── Dot particle ── */
const Particle = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-primary/40"
    style={{ left: x, top: y }}
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.9, 0.4] }}
    transition={{
      duration: 3 + delay,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const particles = [
  { x: "10%", y: "20%", d: 0 },
  { x: "85%", y: "15%", d: 0.8 },
  { x: "5%", y: "65%", d: 1.5 },
  { x: "92%", y: "55%", d: 0.4 },
  { x: "50%", y: "8%", d: 2 },
  { x: "30%", y: "88%", d: 1.1 },
  { x: "70%", y: "80%", d: 0.6 },
  { x: "18%", y: "42%", d: 1.8 },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [6, -6]);
  const rotateY = useTransform(mouseX, [-150, 150], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/6 blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute inset-0 kolam-pattern-bg opacity-20" />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} x={p.x} y={p.y} delay={p.d} />
      ))}

      {/* Rotating Kolam rings */}
      <KolamRing
        size={600}
        opacity={0.15}
        delay={0}
        duration={60}
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <KolamRing
        size={400}
        opacity={0.1}
        delay={0}
        duration={40}
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <KolamRing
        size={220}
        opacity={0.18}
        delay={0}
        duration={25}
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* Top bar: back button + logo */}
      <motion.div
        className="absolute top-6 left-6 right-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-serif font-bold text-lg gradient-text">
            KolamCraft
          </span>
        </Link>
      </motion.div>

      {/* 3D Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        initial={{ opacity: 0, y: 60, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glow layer behind card */}
        <motion.div
          className="absolute -inset-3 rounded-2xl bg-primary/15 blur-2xl"
          style={{ rotateX, rotateY, translateZ: -20 }}
        />

        {/* Card face */}
        <div className="relative glass-strong rounded-2xl p-8 shadow-2xl border border-primary/20">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-7 h-7 text-primary" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your KolamCraft account
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div
                className={`relative flex items-center rounded-xl border transition-all duration-300 ${
                  focused === "email"
                    ? "border-primary/70 bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                    : "border-border bg-muted/40 hover:border-primary/40"
                }`}
              >
                <Mail className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div
                className={`relative flex items-center rounded-xl border transition-all duration-300 ${
                  focused === "password"
                    ? "border-primary/70 bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                    : "border-border bg-muted/40 hover:border-primary/40"
                }`}
              >
                <Lock className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="w-full bg-transparent pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Forgot password */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <button
                type="button"
                className="text-xs text-primary hover:underline underline-offset-2 transition-all"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm box-glow hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Signing in…
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            className="flex items-center gap-3 my-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          {/* Google sign-in */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mb-5"
          >
            <motion.button
              type="button"
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setGoogleLoading(true);
                setTimeout(() => setGoogleLoading(false), 1800);
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-foreground transition-all disabled:opacity-60"
            >
              <AnimatePresence mode="wait">
                {googleLoading ? (
                  <motion.div
                    key="g-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-muted-foreground/40 border-t-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Connecting…
                  </motion.div>
                ) : (
                  <motion.div
                    key="g-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    {/* Google G icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Sign up link */}
          <motion.p
            className="text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
          >
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-primary font-medium hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
