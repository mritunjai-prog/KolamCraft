import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Landmark, Sparkles, Users, Leaf } from "lucide-react";

const features = [
  {
    icon: Landmark,
    title: "Cultural Heritage",
    description: "Centuries-old tradition practiced daily at the thresholds of South Indian homes and temples, preserved digitally.",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Sparkles,
    title: "Sacred Geometry",
    description: "Mathematical precision meets artistic expression. Every pattern follows ancient rules of symmetry and connection.",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    icon: Users,
    title: "Community",
    description: "Share, explore, and learn from a growing community of Kolam artists and enthusiasts worldwide.",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Roots",
    description: "Traditionally drawn with rice flour and natural pigments — our digital canvas keeps that sustainable spirit alive.",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="relative py-32 px-6">
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4">
            Why KolamCraft
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold gradient-text mb-6">
            The Sacred Art of Kolams
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A living tradition that bridges mathematics, spirituality, and community — now accessible to everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <div className="glass rounded-2xl p-8 h-full hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
