import { v4 as uuidv4 } from 'uuid';
import { CustomPreferences } from './types';

export const DEVICE_ID = uuidv4();
export const SERVER_URL = process.env.SERVER_URL as string;
export const REQUEST_LOGS = process.env.REQUEST_LOGS as string;
export const API_URL = process.env.API_URL as string;
export const DEBUG_JELLYFIN_ENDPOINT = process.env.DEBUG_JELLYFIN_ENDPOINT as string;

export const defaultDisplayPrefs: CustomPreferences = {
  SortBy: 'SortName',
  RememberIndexing: false,
  PrimaryImageHeight: 250,
  PrimaryImageWidth: 250,
  CustomPrefs: {
    homesection0: 'resume',
    homesection1: 'smalllibrarytiles',
    homesection2: 'nextup',
    homesection3: 'latestmedia',
    homesection4: 'none',
    homesection5: 'none',
    homesection6: 'none',
    homesection7: 'none',
    homesection8: 'none',
    homesection9: 'none',
    homesection10: 'none',
    chromecastVersion: 'stable',
    skipForwardLength: '30000',
    skipBackLength: '10000',
    enableNextVideoInfoOverlay: 'False',
    tvhome: null,
    dashboardTheme: null
  },
  ScrollDirection: 'Horizontal',
  ShowBackdrop: true,
  RememberSorting: false,
  SortOrder: 'Ascending',
  ShowSidebar: false,
  Client: 'emby'
};
