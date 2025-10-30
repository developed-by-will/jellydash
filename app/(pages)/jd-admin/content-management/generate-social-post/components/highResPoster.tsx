import { PosterType } from '@/app/api/types';
import { useState } from 'react';
import { canvasStyle, customText, posterStyle, templateStyle, textStyle } from '../configs';

type Props = {
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  hiddenPreviewRef: React.RefObject<HTMLDivElement>;
};

export default function HighResPoster(props: Readonly<Props>) {
  const { text, selectedItem, getHighResImageUrl, hiddenPreviewRef } = props;
  const [templateError, setTemplateError] = useState(false);

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
          {templateError ? (
            <div
              style={{
                ...templateStyle,
                backgroundColor: '#f44336',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              Template not found
            </div>
          ) : (
            <img
              src="/social-post-template.png"
              alt="Social post template"
              style={templateStyle}
              crossOrigin="anonymous"
              onError={() => setTemplateError(true)}
            />
          )}

          {/* Text Overlay */}
          {customText.hasCustomText && <div style={textStyle}>{text}</div>}
        </div>
      )}
    </div>
  );
}
