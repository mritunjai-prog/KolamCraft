import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const festivals = [
  { name: "Pongal", region: "Tamil Nadu", period: "January", description: "Harvest festival celebrating the sun god with elaborate Kolams at every doorstep." },
  { name: "Diwali", region: "Pan-India", period: "Oct / Nov", description: "Festival of lights where colorful Rangolis welcome Lakshmi, the goddess of prosperity." },
  { name: "Onam", region: "Kerala", period: "Aug / Sep", description: "Kerala's harvest festival featuring Pookalam — stunning floral Kolam designs." },
  { name: "Navaratri", region: "Pan-India", period: "Sep / Oct", description: "Nine nights of worship with sacred Kolams drawn fresh each morning." },
];

const FestivalsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="festivals" ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4">
            Living Tradition
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold gradient-text mb-6">
            Festival Kolams
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Special occasions call for special patterns — each festival has its own Kolam tradition.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {festivals.map((fest, i) => (
            <motion.div
              key={fest.name}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="glass rounded-2xl p-6 hover:border-primary/20 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs bg-primary/15 text-primary font-medium border border-primary/20">
                  {fest.period}
                </span>
                <span className="text-xs text-muted-foreground">{fest.region}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-glow-sm transition-all">
                {fest.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{fest.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FestivalsSection;
