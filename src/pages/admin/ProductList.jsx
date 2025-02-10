import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import styles from './StockManagement.module.css';

const ProductList = ({ products, startEditing, deleteProduct }) => {
  return (
    <Grid container spacing={3}>
      {products.map((product) => {
        const totalStock = product.variations?.reduce((acc, curr) => acc + (curr.stock || 0), 0);
        const stockPercentage = (totalStock / (product.minStock || 1)) * 100;

        return (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card className={styles.productCard}>
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Avatar src={product.imageUrl} variant="rounded" className={styles.productAvatar}>
                    <PhotoCamera />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className={styles.productName}>
                      {product.name}
                    </Typography>
                    <Chip label={product.category} size="small" sx={{ mt: 1 }} color="primary" />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stockPercentage}
                    color={totalStock < product.minStock ? "error" : "primary"}
                    className={styles.stockProgress}
                  />
                  <Box className={styles.stockInfo}>
                    <Typography variant="caption">Estoque: {totalStock}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Mín: {product.minStock}
                    </Typography>
                  </Box>
                </Box>

                <Box className={styles.actions}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => startEditing(product)}
                    className={styles.button}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => deleteProduct(product.id)}
                    className={styles.button}
                  >
                    Excluir
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProductList;