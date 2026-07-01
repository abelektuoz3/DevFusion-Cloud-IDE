import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  FiCode,
  FiZap,
  FiUsers,
  FiShield,
  FiCloud,
  FiEdit,
  FiCpu,
  FiLayers,
} from "react-icons/fi";

const features = [
  {
    icon: FiCode,
    title: "Multi-Language Support",
    desc: "JavaScript, Python, Java, C++, C#, and more. Write in your preferred language.",
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
  },
  {
    icon: FiZap,
    title: "Instant Execution",
    desc: "Run code and see results in real-time with our lightning-fast execution engine.",
    color: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-50",
  },
  {
    icon: FiEdit,
    title: "Smart Code Editor",
    desc: "Syntax highlighting, auto-completion, error detection, and intelligent suggestions.",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
  },
  {
    icon: FiCloud,
    title: "Cloud Storage",
    desc: "Save and access your projects from anywhere, anytime with automatic backups.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
  },
  {
    icon: FiUsers,
    title: "Team Collaboration",
    desc: "Work together in real-time with team members. Share and review code instantly.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
  },
  {
    icon: FiShield,
    title: "Enterprise Security",
    desc: "JWT authentication, encrypted data, and enterprise-grade security measures.",
    color: "from-red-500 to-rose-500",
    bg: "bg-red-50",
  },
  {
    icon: FiCpu,
    title: "AI-Powered Assistance",
    desc: "Smart code completions, debugging help, and intelligent suggestions.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
  {
    icon: FiLayers,
    title: "Project Management",
    desc: "Organize your projects with folders, tags, and powerful search capabilities.",
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wider uppercase border border-indigo-100 mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Everything You Need to
              <span className="gradient-text"> Code Smarter</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Powerful features designed to make your coding experience seamless
              and productive.
            </p>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 border border-gray-100">
              {/* Gradient Border on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon
                    className={`text-2xl bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                  />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>

                {/* Learn More Link */}
                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
