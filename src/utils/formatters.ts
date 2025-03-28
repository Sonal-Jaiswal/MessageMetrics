
export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0 min';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};
