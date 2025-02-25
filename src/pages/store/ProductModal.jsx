import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800, // Aumentei a largura para acomodar o layout de duas colunas
  maxWidth: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '12px',
  p: 4,
  outline: 'none',
};

function ProductModal({ open, onClose, product, addToCart }) {
  if (!product) return null;

  // Estado para controlar a cor selecionada
  const [selectedColor, setSelectedColor] = useState(product.variations?.[0]?.color || null);
  // Estado para controlar o tamanho selecionado
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Função para adicionar o produto ao carrinho
  const handleAddToCart = () => {
    const selectedVariation = product.variations.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (selectedVariation) {
      const productWithDetails = {
        ...product, // Copia todas as propriedades do produto
        price: product.salePrice, // Mapeia salePrice para price
        variation: selectedVariation, // Inclui a variação selecionada
        quantity: quantity, // Inclui a quantidade selecionada
      };
      addToCart(productWithDetails); // Adiciona o produto ao carrinho
      onClose(); // Fecha o modal
    }
  };

  // Filtra as variações disponíveis para a cor selecionada
  const availableSizes = product.variations
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  // Extrai as cores únicas disponíveis
  const availableColors = [...new Set(product.variations.map((v) => v.color))];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Cabeçalho do modal com botão de fechar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {product.name}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Layout em duas colunas */}
        <Grid container spacing={4}>
          {/* Coluna da imagem */}
          <Grid item xs={12} md={6}>
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Grid>

          {/* Coluna dos detalhes */}
          <Grid item xs={12} md={6}>
            {/* Descrição do produto */}
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {product.description}
            </Typography>

            {/* Preço do produto */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              R$ {product.salePrice.toFixed(2)}
            </Typography>

            {/* Seleção de cor */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Cor:
              </Typography>
              <Stack direction="row" spacing={1}>
                {availableColors.map((color, index) => (
                  <Chip
                    key={index}
                    label={color}
                    onClick={() => setSelectedColor(color)}
                    variant={selectedColor === color ? 'filled' : 'outlined'}
                    color="primary"
                    sx={{
                      cursor: 'pointer',
                      fontWeight: selectedColor === color ? 'bold' : 'normal',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Seleção de tamanho */}
            {selectedColor && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Tamanho:
                </Typography>
                <Stack direction="row" spacing={1}>
                  {availableSizes.map((size, index) => (
                    <Chip
                      key={index}
                      label={size}
                      onClick={() => setSelectedSize(size)}
                      variant={selectedSize === size ? 'filled' : 'outlined'}
                      color="primary"
                      sx={{
                        cursor: 'pointer',
                        fontWeight: selectedSize === size ? 'bold' : 'normal',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Controle de quantidade */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quantidade:
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{ width: '100px' }}
                >
                  {[...Array(10).keys()].map((num) => (
                    <MenuItem key={num + 1} value={num + 1}>
                      {num + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Botão de adicionar ao carrinho */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              fullWidth
              disabled={!selectedColor || !selectedSize}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
            >
              Adicionar ao Carrinho
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

export default ProductModal;