import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { FiEdit, FiPlay, FiShare, FiArrowRight } from "react-icons/fi";

const steps = [
  {
    icon: FiEdit,
    title: "Write Your Code",
    desc: "Use our powerful Monaco editor with syntax highlighting, auto-completion, and real-time error detection.",
    color: "indigo",
    gradient: "from-indigo-500 to-blue-500",
    number: "01",
  },
  {
    icon: FiPlay,
    title: "Run & Test Instantly",
    desc: "Execute your code with one click and see the output in real-time. No waiting, no compiling.",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    number: "02",
  },
  {
    icon: FiShare,
    title: "Share & Collaborate",
    desc: "Share your projects with the world, get feedback, and collaborate with team members seamlessly.",
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
    number: "03",
  },
];

const HowItWorks = () => {
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
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <span className="inline-block px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold tracking-wider uppercase border border-purple-100 mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Get Started in
              <span className="gradient-text"> Three Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From writing code to sharing it with the world - it's that easy.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 transform -translate-y-1/2" />

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative">
                {/* Step Number Background */}
                <div className="absolute -top-4 -right-4 text-7xl font-black text-gray-100/50 select-none">
                  {step.number}
                </div>

                <div className="relative bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group">
                  {/* Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-${step.color}-500/25`}>
                    <step.icon className="text-white text-3xl" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>

                  {/* Step Indicator */}
                  <div className="mt-6 flex items-center text-sm font-medium text-gray-400">
                    <span className="flex items-center">
                      Step {index + 1} of 3
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
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-12 border border-indigo-100/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to start coding?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who use DevFusion Cloud IDE every
              day.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block">
              <a
                href="/register"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300">
                Start Coding Now
                <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
