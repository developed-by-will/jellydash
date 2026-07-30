import {
  Baby,
  ImagePlay,
  MessageCircleReply,
  MessageSquareShare,
  NotepadTextDashed,
  PersonStanding,
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
      url: baseUrl + '/parental-ratings',
      icon: <Baby className={classes} />,
      canAccess: true
    },
    {
      title: 'Delete Playlist Songs',
      url: baseUrl + '/delete-songs',
      icon: <Trash2 className={classes} />,
      canAccess: true
    },
    {
      title: 'Sync Crew & Cast',
      url: baseUrl + '/sync-crew-and-cast',
      icon: <PersonStanding className={classes} />,
      canAccess: false
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
