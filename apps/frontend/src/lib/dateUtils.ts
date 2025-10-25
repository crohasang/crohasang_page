export function convertUTCtoKST(utcDateString: string): string {
  const utcDate = new Date(utcDateString);
  const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  
  return kstDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}