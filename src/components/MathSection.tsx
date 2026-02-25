import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedKolamSVG from "./AnimatedKolamSVG";

const concepts = [
  {
    title: "Rotational Symmetry",
    description: "Kolam patterns exhibit n-fold rotational symmetry, where the design maps onto itself after rotation by 360°/n.",
    tags: ["Dihedral Groups", "Cn Symmetry"],
  },
  {
    title: "Graph Theory",
    description: "Dots form vertices, lines form edges. Each Kolam is a planar graph — often an Eulerian path traversing every edge exactly once.",
    tags: ["Euler Paths", "Planar Graphs"],
  },
  {
    title: "Fractal Geometry",
    description: "Self-similar sub-patterns repeat at multiple scales, creating complex designs from simple recursive rules.",
    tags: ["Self-Similarity", "Recursion"],
  },
];

const MathSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="mathematics" ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Background Kolam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <AnimatedKolamSVG size={800} animate={false} className="w-[800px] h-[800px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4">
            Sacred Mathematics
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold gradient-text mb-6">
            Mathematics of Beauty
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Behind every Kolam lies a deep mathematical structure — the same geometry found in nature, architecture, and the cosmos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {concepts.map((concept, i) => (
            <motion.div
              key={concept.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className="group"
            >
              <div className="glass rounded-2xl p-8 h-full hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                {/* Number */}
                <span className="absolute top-6 right-6 text-7xl font-serif font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-xl font-serif font-semibold text-foreground mb-4 relative">{concept.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative">{concept.description}</p>
                <div className="flex flex-wrap gap-2 relative">
                  {concept.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/15">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MathSection;
