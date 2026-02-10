import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  visible: boolean
  type?: 'info' | 'success' | 'error'
}

export function Toast({ message, visible, type = 'info' }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
            type === 'success'
              ? 'bg-green-600'
              : type === 'error'
                ? 'bg-red-600'
                : 'bg-gray-700'
          } text-white text-sm`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
