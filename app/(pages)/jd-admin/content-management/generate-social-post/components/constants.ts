export const ageBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  color: '#fff',
  borderRadius: 8,
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: 'Arial, Helvetica, sans-serif',
  lineHeight: 1
};

export const OfficialRatingPreviewBadge = {
  ...ageBadgeStyle,
  top: 60,
  left: 36,
  padding: '8px',
  fontSize: '14px'
};

export const OfficialRatingHighResBadge = {
  ...ageBadgeStyle,
  top: 280,
  left: 160,
  padding: '0px 25px 50px 25px',
  fontSize: '56px'
};
