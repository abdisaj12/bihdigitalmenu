import { Clock, CheckCircle2, ChefHat, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered';

interface OrderTrackerProps {
  status: OrderStatus;
  estimatedTime?: number;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
}

export function OrderTracker({
  status,
  estimatedTime = 30,
  preparingAt,
  readyAt,
  deliveredAt,
}: OrderTrackerProps) {
  const steps = [
    { key: 'accepted', label: 'Order Received', icon: CheckCircle2, time: null },
    {
      key: 'preparing',
      label: 'Preparing',
      icon: ChefHat,
      time: preparingAt,
    },
    { key: 'ready', label: 'Ready', icon: Clock, time: readyAt },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: Truck,
      time: deliveredAt,
    },
  ];

  const statusIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full py-6 px-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-[#D84315]/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display">Order Status</h3>
        {status === 'preparing' && estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>~{estimatedTime} min</span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(statusIndex / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[#D84315]"
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= statusIndex;
            const isCurrent = index === statusIndex;

            return (
              <div key={step.key} className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-[#D84315] border-[#D84315] text-white'
                      : 'bg-background border-border text-muted-foreground'
                  } ${isCurrent ? 'ring-4 ring-[#D84315]/20' : ''}`}
                >
                  <Icon className="size-5" />
                </motion.div>
                <div className="text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(step.time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {status === 'delivered' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center"
        >
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Enjoy your meal! 🍽️
          </p>
        </motion.div>
      )}
    </div>
  );
}
