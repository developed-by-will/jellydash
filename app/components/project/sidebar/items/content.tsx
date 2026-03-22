import {
  Baby,
  CalendarSync,
  Drama,
  ImagePlay,
  LayoutTemplate,
  MessageCircleReply,
  MessageSquareShare,
  MonitorPlay,
  NotepadTextDashed,
  PersonStanding,
  Popcorn
} from 'lucide-react';
import { NavItem } from '.';

const classes = 'text-muted-foreground';
const baseUrl = '/content-management';

export const content: NavItem = {
  title: 'Content Management',
  url: '#',
  icon: ImagePlay,
  canAccess: false,
  items: [
    {
      title: 'Parental Ratings',
      url: baseUrl + '/parental-ratings',
      icon: <Baby className={classes} />,
      canAccess: true
    },
    {
      title: 'Convert Playlist',
      url: baseUrl + '/convert-playlist',
      icon: <Baby className={classes} />,
      canAccess: true
    },
    {
      title: 'Sync Crew & Cast',
      url: baseUrl + '/sync-crew-and-cast',
      icon: <PersonStanding className={classes} />,
      canAccess: false
    },
    {
      title: 'Sync Login Page',
      url: baseUrl + '/sync-login-page',
      icon: <LayoutTemplate className={classes} />,
      canAccess: false
    },
    {
      title: 'Sync Creation Dates',
      url: '#',
      icon: <CalendarSync className={classes} />,
      canAccess: false,
      items: [
        {
          title: 'Movies',
          url: baseUrl + '/sync-creation-dates',
          icon: <Popcorn className={classes} />
        },
        {
          title: 'Shows',
          url: baseUrl + '/sync-creation-dates',
          icon: <Drama className={classes} />
        },
        {
          title: 'Episodes',
          url: baseUrl + '/sync-creation-dates',
          icon: <MonitorPlay className={classes} />
        }
      ]
    },
    {
      title: 'Social Post',
      url: '#',
      icon: <MessageSquareShare className={classes} />,
      items: [
        {
          title: 'Generate Post',
          url: baseUrl + '/generate-social-post',
          icon: <MessageCircleReply className={classes} />
        },
        {
          title: 'Set template',
          url: baseUrl + '/set-social-post-template',
          icon: <NotepadTextDashed className={classes} />
        }
      ]
    }
  ]
};
