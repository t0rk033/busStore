import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function ProductModal({ open, onClose, product, addToCart }) {
  if (!product) return null;

  // Função para adicionar o produto ao carrinho
  const handleAddToCart = () => {
    const productWithPrice = {
      ...product, // Copia todas as propriedades do produto
      price: product.salePrice, // Mapeia salePrice para price
    };
    addToCart(productWithPrice); // Adiciona o produto ao carrinho
    onClose(); // Fecha o modal
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <Typography variant="h6" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {product.description}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Preço: R$ {product.salePrice.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddToCart} // Usa a função handleAddToCart
          fullWidth
        >
          Adicionar ao Carrinho
        </Button>
      </Box>
    </Modal>
  );
}

export default ProductModal;