import {
  CalendarSync,
  Drama,
  ImagePlay,
  LayoutTemplate,
  MonitorPlay,
  PersonStanding,
  Popcorn
} from 'lucide-react';

const classes = 'text-muted-foreground';

export const content = {
  title: 'Content Management',
  url: '#',
  icon: ImagePlay,
  items: [
    {
      title: 'Sync Crew & Cast',
      url: '#',
      icon: <PersonStanding className={classes} />
    },
    {
      title: 'Sync Login Page',
      url: '#',
      icon: <LayoutTemplate className={classes} />
    },

    {
      title: 'Sync Creation Dates',
      url: '#',
      icon: <CalendarSync className={classes} />,
      items: [
        {
          title: 'Movies',
          url: '#',
          icon: <Popcorn className={classes} />
        },
        {
          title: 'Shows',
          url: '#',
          icon: <Drama className={classes} />
        },
        {
          title: 'Episodes',
          url: '#',
          icon: <MonitorPlay className={classes} />
        }
      ]
    }
  ]
};
