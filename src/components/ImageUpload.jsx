import React from 'react';
import { Button } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { cloudinaryConfig } from '../clodinaryConfig'

const ImageUpload = ({ onImageUpload }) => {
  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        sources: ['local', 'url', 'camera'], // Fontes de upload
        multiple: false, // Apenas um arquivo por vez
        cropping: true, // Permite cortar a imagem
        croppingAspectRatio: 1, // Proporção 1:1 (quadrado)
        croppingShowBackButton: true,
        croppingCoordinatesMode: 'custom',
        maxFileSize: 1500000, // 1.5MB
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        theme: 'minimal', // Tema do widget
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Poppins', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Poppins',
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          // Retorna a URL da imagem para o componente pai
          onImageUpload(result.info.secure_url);
        }
      }
    );
  };

  return (
    <Button
      variant="contained"
      startIcon={<PhotoCamera />}
      onClick={openCloudinaryWidget}
    >
      Upload de Imagem
    </Button>
  );
};

export default ImageUpload;