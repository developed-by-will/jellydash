'use client';

import { BASE_URL } from '@/app/api/constants';
import { PosterType } from '@/app/api/types';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

export default function useSocialPost() {
  const [selectedItem, setSelectedItem] = useState<PosterType | null>(null);
  const hiddenPreviewRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (item: PosterType) => {
    setSelectedItem(item);

    // Scroll to preview on mobile after item selection
    const isMobile = window.innerWidth < 1024; // LG breakpoint
    if (isMobile) {
      setTimeout(() => {
        const previewElement = document.getElementById('preview');
        if (previewElement) {
          previewElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };

  const getHighResImageUrl = () =>
    `${BASE_URL}/${selectedItem?.Src}?fillHeight=1775&fillWidth=1183&quality=96`;

  const handleDownload = async () => {
    if (!hiddenPreviewRef.current || !selectedItem) return;

    try {
      // Ensure the component is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(hiddenPreviewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#000000',
        logging: false,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            img.crossOrigin = 'anonymous';
          });
        }
      });

      // Check if canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        console.error('Canvas is empty');
        return;
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);

      // Create and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${selectedItem.Name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return {
    selectedItem,
    setSelectedItem,
    hiddenPreviewRef,
    handleItemClick,
    getHighResImageUrl,
    handleDownload
  };
}
