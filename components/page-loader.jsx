"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-zinc-800 p-6 rounded-lg shadow-lg flex items-center space-x-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <span className="text-emerald-100 text-lg font-semibold">Loading...</span>
      </motion.div>
    </motion.div>
  )
}

