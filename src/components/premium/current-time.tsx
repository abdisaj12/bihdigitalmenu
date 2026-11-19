import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="size-4 text-[#D84315]" />
      <div className="flex flex-col sm:flex-row sm:gap-2">
        <span className="font-medium">{formatTime(time)}</span>
        <span className="hidden sm:inline text-muted-foreground">•</span>
        <span className="text-xs sm:text-sm text-muted-foreground">{formatDate(time)}</span>
      </div>
    </div>
  );
}
