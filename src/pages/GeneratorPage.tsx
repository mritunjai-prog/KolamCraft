import React from "react";
import { motion } from "framer-motion";
import NavigationBar from "@/components/NavigationBar";
import { KolamEditor } from "@/kolam-generator/components/KolamEditor";

const GeneratorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavigationBar />

      {/* ── Hero Header ──────────────────────────────────── */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        {/* ambient blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {/* eyebrow */}
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-primary/30 bg-primary/10 text-primary mb-5">
              Algorithmic Art
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="gradient-text text-glow">Kolam</span>{" "}
              <span className="text-foreground">Generator</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Create infinite traditional South Indian kolam patterns —
              algorithmically beautiful, mathematically precise.
            </p>
          </motion.div>

          {/* decorative dot-grid strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center gap-1.5 mt-8"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.12,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Editor ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <KolamEditor />
      </section>
    </div>
  );
};

export default GeneratorPage;
