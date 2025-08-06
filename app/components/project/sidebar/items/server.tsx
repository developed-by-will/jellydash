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
  items: [
    {
      title: 'Subtitle Language',
      url: baseUrl + '/default-subtitle-language',
      icon: <Languages className={classes} />
    },
    {
      title: 'Force New Library Paths',
      url: baseUrl + '/force-new-library-paths',
      icon: <BicepsFlexed className={classes} />
    },

    {
      title: 'Homepage Settings',
      url: '#',
      icon: <House />,
      items: [
        {
          title: 'Library Order',
          url: baseUrl + '/homepage-settings',
          icon: <ArrowDownNarrowWide className={classes} />
        },
        {
          title: 'Content Order',
          url: baseUrl + '/homepage-settings',
          icon: <CalendarArrowDown className={classes} />
        },
        {
          title: 'Display Preferences',
          url: baseUrl + '/homepage-settings',
          icon: <MonitorDown className={classes} />
        }
      ]
    }
  ]
};
