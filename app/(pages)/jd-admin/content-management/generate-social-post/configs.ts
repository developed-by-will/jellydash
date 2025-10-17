import { aristaFont } from '@/app/Hydrate';

export const previewWrapper = {
  aspectRatio: 'aspect-[1440/2160]'
};

export const preview = {
  width: 'w-[92%]',
  height: 'h-[92%]',
  scale: 'scale-90'
};

type CustomTextType = {
  hasCustomText: boolean;
  fontSize: string;
  position: {
    mt: string;
    ms: string;
    me: string;
  };
  color: string;
  align: 'text-start' | 'text-center' | 'text-end';
};

export const customText: CustomTextType = {
  hasCustomText: true,
  fontSize: '16px',
  position: {
    mt: 'mt-[11.5%]',
    ms: 'ms-[0%]',
    me: 'me-[0%]'
  },
  color: 'text-white',
  align: 'text-center'
};

export const texts = [
  {
    text: 'Novidade',
    value: 'Novidade',
    default: true
  },
  {
    text: 'Série Completa',
    value: 'Série Completa'
  },
  {
    text: 'Novo Episódio',
    value: 'Novo Episódio'
  },
  {
    text: 'Final Temporada',
    value: 'Final Temporada'
  },
  {
    text: 'Fim da Série',
    value: 'Fim da Série'
  },
  {
    text: 'Grande Estreia',
    value: 'Grande Estreia'
  },
  {
    text: 'Nova Temporada',
    value: 'Nova Temporada'
  }
];

export const canvasStyle = {
  width: '1440px',
  height: '2160px',
  background: 'black',
  position: 'relative' as const
};

export const posterStyle = {
  position: 'absolute' as const,
  left: '50%',
  top: '51.5%',
  transform: 'translate(-50%, -50%)',
  width: '1183px',
  height: '1775px',
  objectFit: 'cover' as const
};

export const templateStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '1440px',
  height: '2160px'
};

export const textStyle = {
  position: 'absolute' as const,
  top: '7.7%',
  left: '-1%',
  width: '100%',
  color: 'white',
  fontSize: '70px',
  textAlign: 'center' as const,
  fontFamily: aristaFont.style.fontFamily,
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  padding: '0 20px'
};
