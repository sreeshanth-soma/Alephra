"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
}

function WordPullUp({
  words,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  },
  framerProps = {},
  className,
}: WordPullUpProps) {
  // Continuous floating effect per word with index-based delay
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: (i: number) => ({
      y: [0, -6, 0],
      opacity: [1, 0.95, 1],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.12,
      },
    }),
  };

  return (
    <motion.h1
      variants={wrapperFramerProps}
      initial="hidden"
      animate="show"
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {words.split(" ").map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={Object.keys(framerProps).length ? framerProps : itemVariants}
          style={{ display: "inline-block", paddingRight: "8px" }}
        >
          {word === "" ? <span>&nbsp;</span> : word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export { WordPullUp };


