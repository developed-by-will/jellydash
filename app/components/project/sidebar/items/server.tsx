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

export const server = {
  title: 'Manage Server',
  url: '#',
  icon: ServerCog,
  items: [
    {
      title: 'Subtitle Language',
      url: '#',
      icon: <Languages className={classes} />
    },
    {
      title: 'Force New Library Paths',
      url: '#',
      icon: <BicepsFlexed className={classes} />
    },

    {
      title: 'Homepage Settings',
      url: '#',
      icon: <House />,
      items: [
        {
          title: 'Library Order',
          url: '#',
          icon: <ArrowDownNarrowWide className={classes} />
        },
        {
          title: 'Content Order',
          url: '#',
          icon: <CalendarArrowDown className={classes} />
        },
        {
          title: 'Display Preferences',
          url: '#',
          icon: <MonitorDown className={classes} />
        }
      ]
    }
  ]
};
