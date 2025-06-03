type Item = {
  Id: string;
  Name: string;
  PremiereDate: string;
  CommunityRating: number;
  ImageTags: {
    Primary: string;
  };
};

export type response = {
  Items: Item[];
};

export interface BrandingPayload {
  LoginDisclaimer: string;
  CustomCss: string;
}
