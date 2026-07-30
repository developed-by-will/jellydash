import {
  ArrowDownNarrowWide,
  CalendarArrowDown,
  House,
  MonitorDown,
  ServerCog
} from 'lucide-react';

const classes = 'text-muted-foreground';
const baseUrl = '/manage-server';

export const server = {
  title: 'Manage Server',
  url: '#',
  icon: ServerCog,
  canAccess: false,
  items: [
    {
      title: 'Homepage Settings',
      url: '#',
      icon: <House />,
      canAccess: false,
      items: [
        {
          title: 'Library Order',
          url: baseUrl + '/homepage-settings',
          icon: <ArrowDownNarrowWide className={classes} />,
          canAccess: false
        },
        {
          title: 'Content Order',
          url: baseUrl + '/homepage-settings',
          icon: <CalendarArrowDown className={classes} />,
          canAccess: false
        },
        {
          title: 'Display Preferences',
          url: baseUrl + '/homepage-settings',
          icon: <MonitorDown className={classes} />,
          canAccess: false
        }
      ]
    }
  ]
};
