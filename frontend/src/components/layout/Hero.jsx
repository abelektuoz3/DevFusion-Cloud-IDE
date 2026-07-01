import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { FiPlay, FiGithub, FiZap, FiCode, FiUsers } from "react-icons/fi";

const Hero = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
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
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingIcons = [
    { icon: FiCode, color: "text-indigo-500", delay: 0 },
    { icon: FiZap, color: "text-yellow-500", delay: 1 },
    { icon: FiUsers, color: "text-purple-500", delay: 2 },
  ];

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.color}`}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 3 + index,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
            style={{
              top: `${20 + index * 25}%`,
              left: `${5 + index * 30}%`,
            }}>
            <item.icon size={40 + index * 10} className="opacity-20" />
          </motion.div>
        ))}
      </div>

      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">
              🚀 10K+ developers trust DevFusion
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight">
            <span className="text-gray-900">Code in the</span>
            <br />
            <span className="gradient-text">Cloud IDE</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Write, run, and share code instantly with a powerful,
            <span className="font-semibold text-gray-900">
              {" "}
              zero-setup
            </span>{" "}
            cloud IDE. Perfect for learning, teaching, and rapid prototyping.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300">
                <FiPlay className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Start Coding Free
                <svg
                  className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                <FiGithub className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                View on GitHub
              </a>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                value: "10K+",
                label: "Active Developers",
                color: "from-indigo-500 to-blue-500",
              },
              {
                value: "50K+",
                label: "Projects Created",
                color: "from-purple-500 to-pink-500",
              },
              {
                value: "5+",
                label: "Languages Supported",
                color: "from-pink-500 to-rose-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="font-medium text-gray-500">
              Trusted by teams at
            </span>
            <div className="flex items-center gap-8">
              {["Google", "Microsoft", "Amazon", "Netflix"].map(
                (company, index) => (
                  <span
                    key={index}
                    className="font-semibold text-gray-300 hover:text-gray-600 transition-colors">
                    {company}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
