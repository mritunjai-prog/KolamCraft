import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import kolamHero from "@/assets/kolam-hero.jpg";

const words = ["கோலம்", "ముగ్గు", "ರಂಗೋಲಿ", "കോലം", "रंगोली", "Kolam"];

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imgRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[80px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        <div className="absolute inset-0 kolam-pattern-bg opacity-30" />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-7xl mx-auto px-6 pt-24"
      >
        {/* Left content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-primary/15 text-primary border border-primary/30">
              SIH 2025 • Heritage & Culture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8 mt-4"
          >
            <span className="block gradient-text pb-1">The Art of</span>
            <span className="relative block min-h-[1.6em] mt-3">
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  className="absolute top-0 left-0 right-0 text-glow text-foreground"
                  style={{ clipPath: "inset(-20% -10% -30% -10%)" }}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{
                    y:
                      i === wordIndex
                        ? "0%"
                        : i === (wordIndex - 1 + words.length) % words.length
                          ? "-110%"
                          : "110%",
                    opacity: i === wordIndex ? 1 : 0,
                  }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            Create, explore, and preserve the sacred geometry of South India's
            ancient threshold art — digitally reimagined.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link to="/canvas">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg box-glow"
              >
                Start Creating
              </motion.button>
            </Link>
            <Link to="/explore">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border border-border text-foreground font-medium text-lg hover:bg-secondary/50 hover:border-primary/30 transition-colors"
              >
                Explore Gallery
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="flex gap-10 mt-14 justify-center lg:justify-start"
          >
            {[
              { val: "16+", label: "Pattern Types" },
              { val: "∞", label: "Combinations" },
              { val: "6", label: "Languages" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold gradient-text">{val}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right - Kolam Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="flex-1 relative flex items-center justify-center"
          style={{ y: imgY }}
        >
          <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]">
            {/* Outer glow rings */}
            <div className="absolute inset-[-30px] rounded-full border border-primary/15 animate-spin-slow" />
            <div
              className="absolute inset-[-55px] rounded-full border border-primary/8 animate-spin-slow"
              style={{
                animationDirection: "reverse",
                animationDuration: "45s",
              }}
            />
            <div
              className="absolute inset-[-80px] rounded-full border border-primary/5 animate-spin-slow"
              style={{ animationDuration: "60s" }}
            />

            {/* Glow behind image */}
            <div className="absolute inset-[-20px] rounded-full bg-primary/10 blur-[60px] animate-pulse-glow" />

            {/* Kolam image */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="relative w-full h-full"
            >
              <img
                src={kolamHero}
                alt="Traditional Kolam Pattern"
                className="w-full h-full object-cover rounded-full shadow-2xl"
                style={{
                  maskImage:
                    "radial-gradient(circle, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(circle, black 60%, transparent 100%)",
                }}
              />
            </motion.div>

            {/* Floating dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <motion.div
                key={deg}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  top: `${50 + 55 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 55 * Math.cos((deg * Math.PI) / 180)}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
