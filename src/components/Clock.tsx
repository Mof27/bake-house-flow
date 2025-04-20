
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-4 left-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {format(time, 'HH:mm:ss')}
    </div>
  );
};

export default Clock;
