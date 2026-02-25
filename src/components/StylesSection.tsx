import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import kolamPulli from "@/assets/kolam-pulli.jpg";
import kolamChikku from "@/assets/kolam-chikku.jpg";
import kolamSanskar from "@/assets/kolam-sanskar.jpg";
import kolamKavi from "@/assets/kolam-kavi.jpg";

const styles = [
  {
    name: "Pulli Kolam",
    description: "Dot-based patterns where lines weave around a grid of dots, creating mesmerizing geometric designs.",
    dots: "Grid-aligned",
    complexity: "Beginner → Advanced",
    image: kolamPulli,
  },
  {
    name: "Chikku Kolam",
    description: "Interlaced loop designs that form continuous, never-ending curves — symbolizing the cycle of life.",
    dots: "Intertwined",
    complexity: "Intermediate",
    image: kolamChikku,
  },
  {
    name: "Sanskar Bharathi",
    description: "Colorful Rangoli-style patterns with vibrant fills and bold outlines, celebrating festivals with joy.",
    dots: "Freeform",
    complexity: "Advanced",
    image: kolamSanskar,
  },
  {
    name: "Kavi Kolam",
    description: "Sacred temple patterns drawn with red oxide and white, carrying deep spiritual significance.",
    dots: "Minimal",
    complexity: "Sacred",
    image: kolamKavi,
  },
];

const StylesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="styles" ref={ref} className="relative py-32 px-6">
      <div className="absolute inset-0 kolam-pattern-bg opacity-20" />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4">
            Diverse Traditions
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold gradient-text mb-6">
            Explore Kolam Styles
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each style carries centuries of tradition, mathematics, and spiritual depth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {styles.map((style, i) => (
            <motion.div
              key={style.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative overflow-hidden rounded-2xl glass cursor-pointer"
            >
              {/* Background image */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hovered === i ? 1.1 : 1,
                    opacity: hovered === i ? 0.25 : 0.1,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>

              <div className="relative p-8 md:p-10 min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-glow-sm transition-all">
                      {style.name}
                    </h3>
                    <motion.div
                      animate={{ rotate: hovered === i ? 45 : 0, scale: hovered === i ? 1.2 : 1 }}
                      className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary shrink-0 ml-4"
                    >
                      +
                    </motion.div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">{style.description}</p>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    {style.dots}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    {style.complexity}
                  </span>
                </div>
              </div>

              {/* Bottom glow on hover */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hovered === i ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StylesSection;
