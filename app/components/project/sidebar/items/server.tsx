import {
  ArrowDownNarrowWide,
  BicepsFlexed,
  CalendarArrowDown,
  House,
  Languages,
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
      title: 'Subtitle Language',
      url: baseUrl + '/default-subtitle-language',
      icon: <Languages className={classes} />,
      canAccess: false
    },
    {
      title: 'Force New Library Paths',
      url: baseUrl + '/force-new-library-paths',
      icon: <BicepsFlexed className={classes} />,
      canAccess: false
    },

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
