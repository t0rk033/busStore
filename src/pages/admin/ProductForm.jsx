import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { Add, Edit, PhotoCamera } from "@mui/icons-material";
import styles from './StockManagement.module.css';

const ProductForm = ({
  newProduct,
  handleInputChange,
  handleVariationChange,
  addVariation,
  saveProduct,
  resetForm,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3, my: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {newProduct.id ? "Editar Produto" : "Novo Produto"}
      </Typography>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Informações Básicas
          </Typography>
          {["sku", "barcode", "name", "category"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={newProduct[field]}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
              size="small"
            />
          ))}
        </Grid>

        {/* Imagem do Produto */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Imagem do Produto
          </Typography>
          <Box className={styles.imagePreview}>
            {newProduct.imageUrl ? (
              <img src={newProduct.imageUrl} alt="Preview" className={styles.imagePreview} />
            ) : (
              <Box sx={{ color: "text.secondary" }}>
                <PhotoCamera sx={{ fontSize: 40 }} />
                <Typography>URL da Imagem</Typography>
              </Box>
            )}
            <TextField
              fullWidth
              name="imageUrl"
              value={newProduct.imageUrl}
              onChange={handleInputChange}
              sx={{ mt: 2 }}
              size="small"
            />
          </Box>
        </Grid>

        {/* Preços e Dimensões */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Preços e Dimensões
          </Typography>
          <Grid container spacing={2}>
            {["costPrice", "salePrice", "weight"].map((field) => (
              <Grid item xs={4} key={field}>
                <TextField
                  label={field === "costPrice" ? "Preço de Custo" : field === "salePrice" ? "Preço de Venda" : "Peso"}
                  name={field}
                  value={newProduct[field]}
                  onChange={handleInputChange}
                  fullWidth
                  type="number"
                  InputProps={{ startAdornment: field.includes("Price") && "R$" }}
                  size="small"
                />
              </Grid>
            ))}
            {["length", "width", "height"].map((dim) => (
              <Grid item xs={4} key={dim}>
                <TextField
                  label={`Dimensão (${dim})`}
                  name={dim}
                  value={newProduct.dimensions[dim]}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "dimensions", value: { ...newProduct.dimensions, [dim]: e.target.value } },
                    })
                  }
                  fullWidth
                  type="number"
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Variações */}
        <Grid item xs={12}>
          <Box className={styles.variationSection}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1" className={styles.variationTitle}>
                Variações
              </Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={addVariation} size="small">
                Adicionar Variação
              </Button>
            </Box>
            {newProduct.variations.map((variation, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  {["size", "color", "model", "stock"].map((field) => (
                    <Grid item xs={3} key={field}>
                      <TextField
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={variation[field]}
                        onChange={(e) => handleVariationChange(index, field, e.target.value)}
                        fullWidth
                        size="small"
                        type={field === "stock" ? "number" : "text"}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Ações do Formulário */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={saveProduct} startIcon={<Edit />}>
              {newProduct.id ? "Atualizar" : "Salvar"}
            </Button>
            <Button variant="outlined" onClick={resetForm}>
              Cancelar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductForm;