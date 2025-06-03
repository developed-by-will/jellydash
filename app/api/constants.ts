import { v4 as uuidv4 } from 'uuid';

export const DEVICE_ID = uuidv4();

export const SERVER_URL = process.env.SERVER_URL as string;
