
// Format elapsed time as MM:SS
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format date and time in a readable format
export const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};
