
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed top-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full ${
      isOnline ? 'bg-green-500/10' : 'bg-red-500/10'
    }`}>
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
    </div>
  );
};

export default OnlineStatus;
