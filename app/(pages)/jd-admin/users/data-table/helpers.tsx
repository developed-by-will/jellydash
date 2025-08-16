import { AUTENTICATED_POST } from '@/app/utils/requestHandler';
import { Badge } from '@/components/ui/badge';

export const success = 'bg-emerald-600 hover:bg-emerald-700 text-sm';

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isToday(date)) {
      return (
        <Badge variant="default" className={success}>
          Today at {''}
          {date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </Badge>
      );
    } else {
      // Format as "MMM DD, YYYY, HH:MM AM/PM"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch (e) {
    console.error('Error parsing date:', e);
    return dateString;
  }
};

export async function userStatusHandler(Id: string, IsDisabled: boolean, token: string) {
  await AUTENTICATED_POST(`/api/users/update-status`, { Id, IsDisabled }, token);

  window.location.reload();
}
