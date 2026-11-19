import { Bell, MessageSquare, Receipt, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CallWaiterProps {
  tableOrRoom: string;
}

type RequestType = 'waiter' | 'bill' | 'assistance' | 'feedback';

export function CallWaiter({ tableOrRoom }: CallWaiterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const requestTypes = [
    { type: 'waiter' as const, label: 'Call Waiter', icon: Bell, color: 'bg-blue-500' },
    { type: 'bill' as const, label: 'Request Bill', icon: Receipt, color: 'bg-green-500' },
    {
      type: 'assistance' as const,
      label: 'Need Help',
      icon: HelpCircle,
      color: 'bg-orange-500',
    },
    {
      type: 'feedback' as const,
      label: 'Send Feedback',
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
  ];

  const handleSendRequest = async () => {
    if (!selectedType) return;

    setSending(true);
    try {
      const { error } = await supabase.from('service_calls').insert({
        table_or_room: tableOrRoom,
        request_type: selectedType,
        message: message.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Request sent! Our team will be with you shortly.');
      setIsOpen(false);
      setSelectedType(null);
      setMessage('');
    } catch (error) {
      console.error('Error sending service request:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex items-center justify-center w-14 h-14 bg-[#D84315] hover:bg-[#BF360C] text-white rounded-full shadow-elegant transition-all duration-300"
        aria-label="Call for service"
      >
        <Bell className="size-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-background rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-display">How can we help?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tableOrRoom}
                  </p>
                </div>

                {!selectedType ? (
                  <div className="grid grid-cols-2 gap-3">
                    {requestTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.type}
                          onClick={() => setSelectedType(type.type)}
                          className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-[#D84315]/60 bg-card hover:bg-card/80 transition-all group"
                        >
                          <div
                            className={`${type.color} w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="size-6" />
                          </div>
                          <span className="text-sm font-medium text-center">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-[#D84315]/10 rounded-2xl">
                      {(() => {
                        const selected = requestTypes.find(
                          (t) => t.type === selectedType
                        );
                        if (!selected) return null;
                        const Icon = selected.icon;
                        return (
                          <>
                            <div
                              className={`${selected.color} w-10 h-10 rounded-full flex items-center justify-center text-white`}
                            >
                              <Icon className="size-5" />
                            </div>
                            <span className="font-medium">{selected.label}</span>
                          </>
                        );
                      })()}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Additional message (optional)
                      </label>
                      <Textarea
                        placeholder="Any specific requests or details..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="resize-none rounded-2xl"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedType(null);
                          setMessage('');
                        }}
                        className="flex-1 rounded-full"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSendRequest}
                        disabled={sending}
                        className="flex-1 rounded-full bg-[#D84315] hover:bg-[#BF360C]"
                      >
                        {sending ? 'Sending...' : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                )}

                {!selectedType && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="w-full rounded-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
