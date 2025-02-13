import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '12px',
  p: 4,
  outline: 'none',
};

function ProductModal({ open, onClose, product, addToCart }) {
  if (!product) return null;

  // Estado para controlar a variação selecionada
  const [selectedVariation, setSelectedVariation] = useState(product.variations?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Função para adicionar o produto ao carrinho
  const handleAddToCart = () => {
    const productWithPrice = {
      ...product, // Copia todas as propriedades do produto
      price: product.salePrice, // Mapeia salePrice para price
      variation: selectedVariation, // Inclui a variação selecionada
      quantity: quantity, // Inclui a quantidade selecionada
    };
    addToCart(productWithPrice); // Adiciona o produto ao carrinho
    onClose(); // Fecha o modal
  };

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

        {/* Imagem do produto */}
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '250px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        />

        {/* Descrição do produto */}
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {product.description}
        </Typography>

        {/* Preço do produto */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          R$ {product.salePrice.toFixed(2)}
        </Typography>

        {/* Variações do produto */}
        {product.variations && product.variations.length > 0 && (
          <FormControl fullWidth sx={{ marginBottom: '16px' }}>
            <InputLabel id="variation-label">Variação</InputLabel>
            <Select
              labelId="variation-label"
              value={selectedVariation?.name || ''}
              onChange={(e) => {
                const selected = product.variations.find((v) => v.name === e.target.value);
                setSelectedVariation(selected);
              }}
              label="Variação"
            >
              {product.variations.map((variation, index) => (
                <MenuItem key={index} value={variation.name}>
                  <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography>{variation.name}</Typography>
                    <Chip
                      label={`Estoque: ${variation.stock}`}
                      size="small"
                      color={variation.stock > 0 ? 'success' : 'error'}
                    />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Controle de quantidade */}
        <FormControl fullWidth sx={{ marginBottom: '16px' }}>
          <InputLabel id="quantity-label">Quantidade</InputLabel>
          <Select
            labelId="quantity-label"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            label="Quantidade"
          >
            {[...Array(10).keys()].map((num) => (
              <MenuItem key={num + 1} value={num + 1}>
                {num + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Botão de adicionar ao carrinho */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddToCart}
          fullWidth
          disabled={!selectedVariation || selectedVariation.stock < quantity}
          sx={{ py: 1.5, fontWeight: 'bold' }}
        >
          Adicionar ao Carrinho
        </Button>

        {/* Mensagem de estoque insuficiente */}
        {selectedVariation && selectedVariation.stock < quantity && (
          <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'center' }}>
            Estoque insuficiente para a quantidade selecionada.
          </Typography>
        )}
      </Box>
    </Modal>
  );
}

export default ProductModal;