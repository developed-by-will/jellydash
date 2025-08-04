import { LoginResponseType } from './(pages)/login/formValidations';

export type LoginResponseTypeExtended = LoginResponseType & {
  SessionInfo: {
    PlayState: {
      CanSeek: boolean;
      IsPaused: boolean;
      IsMuted: boolean;
      RepeatMode: string;
      PlaybackOrder: string;
    };
    AdditionalUsers: any[];
    Capabilities: {
      PlayableMediaTypes: string[];
      SupportedCommands: string[];
      SupportsMediaControl: boolean;
      SupportsPersistentIdentifier: boolean;
    };
    RemoteEndPoint: string;
    PlayableMediaTypes: string[];
    Id: string;
    UserId: string;
    UserName: string;
    Client: string;
    LastActivityDate: string;
    LastPlaybackCheckIn: string;
    DeviceName: string;
    DeviceId: string;
    ApplicationVersion: string;
    IsActive: boolean;
    SupportsMediaControl: boolean;
    SupportsRemoteControl: boolean;
    NowPlayingQueue: any[];
    NowPlayingQueueFullItems: any[];
    HasCustomDeviceName: boolean;
    ServerId: string;
    UserPrimaryImageTag: string;
    SupportedCommands: string[];
  };
  message: string;
};
