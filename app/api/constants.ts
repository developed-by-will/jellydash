import { v4 as uuidv4 } from 'uuid';
import { CustomPreferencesAndroidTV, CustomPreferencesBase } from './types';

const PROTOCOL = process.env.NEXT_PUBLIC_IMAGE_PROTOCOL as string;
const HOSTNAME = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME as string;

export const DEVICE_ID = uuidv4();
export const SERVER_URL = process.env.SERVER_URL as string;
export const REQUEST_LOGS = process.env.REQUEST_LOGS as string;
export const API_URL = process.env.API_URL as string;
export const DEBUG_JELLYFIN_ENDPOINT = process.env.DEBUG_JELLYFIN_ENDPOINT as string;
export const JELLYFIN_MOBILE_VERSION = process.env.JELLYFIN_MOBILE_VERSION as string;
export const JELLYFIN_TV_VERSION = process.env.JELLYFIN_TV_VERSION as string;
export const BASE_URL = `${PROTOCOL}://${HOSTNAME}`;

export const mobileDisplayPrefs: CustomPreferencesBase = {
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

export const tvDisplayPrefs: CustomPreferencesAndroidTV = {
  SortBy: 'SortName',
  RememberIndexing: false,
  PrimaryImageHeight: 250,
  PrimaryImageWidth: 250,
  CustomPrefs: {
    chromecastVersion: 'stable',
    skipForwardLength: '30000',
    skipBackLength: '10000',
    enableNextVideoInfoOverlay: 'False',
    tvhome: null,
    dashboardTheme: null,
    FilterFavoritesOnly: 'false',
    FilterUnwatchedOnly: 'false',
    GridDirection: 'VERTICAL',
    PosterSize: 'LARGE',
    SmartScreen: 'false',
    SortBy: 'SORT_NAME',
    SortOrder: 'ASCENDING'
  },
  ScrollDirection: 'Horizontal',
  ShowBackdrop: true,
  RememberSorting: false,
  SortOrder: 'Ascending',
  ShowSidebar: false,
  Client: 'jellyfin-androidtv'
};

export const MPARatings = [
  {
    label: 'All Ages',
    value: 'P'
  },
  {
    label: 'M/3',
    value: 'M/3'
  },
  {
    label: 'M/6',
    value: 'M/6'
  },
  {
    label: 'M/12',
    value: 'M/12'
  },
  {
    label: 'M/14',
    value: 'M/14'
  },
  {
    label: 'M/16',
    value: 'M/16'
  },
  {
    label: 'M/18',
    value: 'M/18'
  }
];
