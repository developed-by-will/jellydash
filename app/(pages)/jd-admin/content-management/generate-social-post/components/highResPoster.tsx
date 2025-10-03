import { PosterType } from '@/app/api/types';
import template from '@/public/social-post-template.png';
import { canvasStyle, customText, posterStyle, templateStyle, textStyle } from '../configs';

type Props = {
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  hiddenPreviewRef: React.RefObject<HTMLDivElement>;
};

export default function HighResPoster(props: Readonly<Props>) {
  const { text, selectedItem, getHighResImageUrl, hiddenPreviewRef } = props;

  return (
    <div
      ref={hiddenPreviewRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1440px',
        height: '2160px'
      }}
    >
      {selectedItem && (
        <div style={canvasStyle}>
          {/* Poster Image */}
          <img
            src={getHighResImageUrl()}
            alt={selectedItem.Name}
            style={posterStyle}
            crossOrigin="anonymous"
          />

          {/* Template Overlay */}
          <img
            src={template.src}
            alt="Social post template"
            style={templateStyle}
            crossOrigin="anonymous"
          />

          {/* Text Overlay */}
          {customText.hasCustomText && <div style={textStyle}>{text}</div>}
        </div>
      )}
    </div>
  );
}
