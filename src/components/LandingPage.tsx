import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Heart, Users, Leaf, Brain, Zap, Star } from 'lucide-react';
import exampleImage from 'figma:asset/0c59a21c53e3e4e7a8dbd8adb9310b1728dd9e90.png';
import design68 from '../assets/design68.jpg';
import design93 from '../assets/design93.png';
import design588 from '../assets/design588.jpeg';
import design98 from '../assets/design98.jpeg';

const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const kolamTypes = [
    {
      name: 'Pulli Kolam',
      description: 'Dot-based patterns with intricate connections',
      image: design93
    },
    {
      name: 'Chikku Kolam',
      description: 'Continuous flowing lines without breaks',
      image: design98
    },
    {
      name: 'Sanskar Bharathi',
      description: 'Freehand artistic expressions with vibrant colors',
      image: design588
    },
    {
      name: 'Kavi Kolam',
      description: 'Geometric precision with mathematical beauty',
      image: design68
    }
  ];

  const festivals = [
    { 
      name: 'Pongal', 
      season: 'Harvest Festival',
      image: design93
    },
    { 
      name: 'Diwali', 
      season: 'Festival of Lights',
      image: design98
    },
    { 
      name: 'Onam', 
      season: 'Kerala New Year',
      image: design68
    },
    { 
      name: 'Navaratri', 
      season: 'Nine Nights',
      image: design588
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % kolamTypes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Decorative Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100">
          <div className="absolute inset-4 border-4 border-orange-300 rounded-2xl opacity-20"></div>
          <div className="absolute top-8 left-8 w-16 h-16 border-2 border-pink-400 rounded-full opacity-30"></div>
          <div className="absolute top-8 right-8 w-12 h-12 border-2 border-orange-400 rounded-full opacity-30"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 border-2 border-yellow-400 rounded-full opacity-30"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-pink-400 rounded-full opacity-30"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
              KolamCraft
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4">
              கோலம் | ముగ్గులు | ರಂಗೋಲಿ | കൊലം| ಮೊಕ್ಲು | कोलम | ಕೊಲಮ್
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Enter into the sacred world of Kolams. Create, explore, and share traditional Indian floor art with modern digital tools while preserving ancient wisdom.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4">
              <Link to="/canvas">
                Start Creating <Sparkles className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4">
              <Link to="/explore">
                Explore Designs <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Animated Kolam Preview */}
        <motion.div
          className="absolute bottom-10 right-10 hidden lg:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-32 h-32 border-4 border-orange-400 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-pink-400 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* The Importance of Kolams */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">The Sacred Art of Kolams</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              More than just decorative patterns, Kolams represent the harmony between art, spirituality, mathematics, and nature.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8 text-pink-500" />,
                title: "Cultural Heritage",
                description: "Passed down through generations, Kolams preserve ancient Tamil traditions and family bonds."
              },
              {
                icon: <Star className="w-8 h-8 text-yellow-500" />,
                title: "Spiritual Significance",
                description: "Sacred patterns that invoke blessings, prosperity, and positive energy into homes."
              },
              {
                icon: <Users className="w-8 h-8 text-blue-500" />,
                title: "Community Connection",
                description: "Bringing neighbors together through shared artistic expression and cultural celebration."
              },
              {
                icon: <Leaf className="w-8 h-8 text-green-500" />,
                title: "Eco-Friendly Art",
                description: "Made with rice flour and natural materials, feeding insects and birds while beautifying spaces."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{item.icon}</div>
                    <h3 className="text-xl mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Kolams */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">Explore Different Kolam Styles</h2>
            <p className="text-xl text-gray-600">Each style has its own unique characteristics and cultural significance</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {kolamTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 relative overflow-hidden">
                    <img 
                      src={type.image} 
                      alt={type.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl mb-2">{type.name}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mathematics Behind Kolams */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">The Mathematics of Sacred Geometry</h2>
            <p className="text-xl text-gray-600">Discover the fascinating mathematical principles embedded in traditional Kolam designs</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-purple-500" />,
                title: "Symmetry & Transformations",
                description: "Explore rotational, reflective, and translational symmetries that create perfect geometric harmony.",
                concepts: ["Reflection", "Rotation", "Translation", "Scaling"]
              },
              {
                icon: <Brain className="w-8 h-8 text-indigo-500" />,
                title: "Graph Theory",
                description: "Kolams represent complex graphs where dots are vertices and lines are edges, often forming Eulerian paths.",
                concepts: ["Vertices", "Edges", "Eulerian Paths", "Connectivity"]
              },
              {
                icon: <Sparkles className="w-8 h-8 text-pink-500" />,
                title: "Fractal Patterns",
                description: "Self-similar patterns that repeat at different scales, creating infinite complexity from simple rules.",
                concepts: ["Self-Similarity", "Recursion", "Scale Invariance", "Iteration"]
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">{item.icon}</div>
                    <h3 className="text-xl mb-3 text-center">{item.title}</h3>
                    <p className="text-gray-600 mb-4 text-center">{item.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {item.concepts.map((concept) => (
                        <Badge key={concept} variant="secondary" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Festival Kolams */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">Kolams Through the Seasons</h2>
            <p className="text-xl text-gray-600">Special designs for festivals and celebrations throughout the year</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {festivals.map((festival, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-gradient-to-br from-white to-orange-50 hover:shadow-lg transition-all">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl mb-2">{festival.name}</h3>
                    <p className="text-gray-600">{festival.season}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl mb-6">Begin Your Kolam Journey</h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of artists and tradition keepers. Create, learn, and share the beauty of Kolams with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                <Link to="/canvas">Start Creating Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                <Link to="/register">Join the Community</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;