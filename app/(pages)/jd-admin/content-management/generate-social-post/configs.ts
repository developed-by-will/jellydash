export const previewWrapper = {
  aspectRatio: '1440/2160'
};

export const preview = {
  width: '92%',
  height: '92%',
  scale: '90'
};

export const output = {
  template: {
    width: '1440px',
    height: '2160px'
  },
  poster: {
    width: 1183,
    height: 1775,
    position: {
      left: '50%',
      top: '51.5%'
    },
    transform: 'translate(-50%, -50%)'
  },
  output: {
    width: 1440,
    height: 2160
  }
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
  fontSize: '70px',
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
  }
];
