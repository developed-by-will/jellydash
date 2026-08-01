import {
  Baby,
  Clapperboard,
  ImagePlay,
  MessageCircleReply,
  MessageSquareShare,
  NotepadTextDashed,
  PersonStanding,
  Star,
  Trash2
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
      url: '#',
      icon: <Baby className={classes} />,
      items: [
        {
          title: 'Rate Content',
          url: baseUrl + '/parental-ratings',
          icon: <Baby className={classes} />
        },
        {
          title: 'Manage Ratings',
          url: baseUrl + '/manage-ratings',
          icon: <Star className={classes} />
        }
      ]
    },
    {
      title: 'Delete Playlist Songs',
      url: baseUrl + '/delete-songs',
      icon: <Trash2 className={classes} />,
      canAccess: true
    },
    {
      title: 'Watchlist Settings',
      url: baseUrl + '/watchlist-settings',
      icon: <Clapperboard className={classes} />,
      canAccess: true
    },
    {
      title: 'Sync Crew & Cast',
      url: baseUrl + '/sync-crew-and-cast',
      icon: <PersonStanding className={classes} />,
      canAccess: true
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
