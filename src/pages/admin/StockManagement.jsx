import React, { useState, useEffect } from "react";
import {
  Button, Card, CardContent, Typography, TextField, Grid,
  Box, Chip, IconButton, Paper, Avatar, useTheme, LinearProgress
} from "@mui/material";
import { Add, Edit, Delete, PhotoCamera, Inventory } from "@mui/icons-material";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

function StockManagement() {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    subcategory: "",
    variations: [{ size: "", color: "", model: "", stock: 0 }],
    costPrice: "",
    salePrice: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    minStock: 0,
    location: "",
    reservedStock: 0,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Buscar produtos do Firestore
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (querySnapshot) => {
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        variations: doc.data().variations || [],
      }));
      setProducts(productsData);
    });

    return () => unsubscribeProducts();
  }, []);

  // Buscar vendas do Firestore e calcular o total vendido
  useEffect(() => {
    const unsubscribeSales = onSnapshot(collection(db, "sales"), (querySnapshot) => {
      const salesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSales(salesData);

      // Calcular o total vendido
      const total = salesData.reduce((acc, sale) => acc + sale.total, 0);
      setTotalSales(total);
    });

    return () => unsubscribeSales();
  }, []);

  // Atualiza campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Adiciona uma nova variação ao produto
  const addVariation = () => {
    setNewProduct({
      ...newProduct,
      variations: [...newProduct.variations, { size: "", color: "", model: "", stock: 0 }],
    });
  };

  // Atualiza uma variação específica
  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[index][field] = value;
    setNewProduct({ ...newProduct, variations: updatedVariations });
  };

  // Adiciona um novo produto ao Firestore
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category) return;

    const formattedProduct = {
      ...newProduct,
      costPrice: parseFloat(newProduct.costPrice),
      salePrice: parseFloat(newProduct.salePrice),
      weight: parseFloat(newProduct.weight),
      dimensions: {
        length: parseFloat(newProduct.dimensions.length),
        width: parseFloat(newProduct.dimensions.width),
        height: parseFloat(newProduct.dimensions.height),
      },
      variations: newProduct.variations || [],
    };

    const docRef = await addDoc(collection(db, "products"), formattedProduct);
    setProducts([...products, { id: docRef.id, ...formattedProduct }]);
    setNewProduct({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      imageUrl: "",
      category: "",
      subcategory: "",
      variations: [{ size: "", color: "", model: "", stock: 0 }],
      costPrice: "",
      salePrice: "",
      weight: "",
      dimensions: { length: "", width: "", height: "" },
      minStock: 0,
      location: "",
      reservedStock: 0,
    });
  };

  // Remove um produto do Firestore
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter((product) => product.id !== id));
  };

  // Define o produto para edição
  const startEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      variations: product.variations || [],
    });
  };

  // Atualiza um produto editado no Firestore
  const updateProduct = async () => {
    if (!editingProduct) return;

    const updatedProduct = {
      ...newProduct,
      costPrice: parseFloat(newProduct.costPrice),
      salePrice: parseFloat(newProduct.salePrice),
      weight: parseFloat(newProduct.weight),
      dimensions: {
        length: parseFloat(newProduct.dimensions.length),
        width: parseFloat(newProduct.dimensions.width),
        height: parseFloat(newProduct.dimensions.height),
      },
      variations: newProduct.variations || [],
    };

    await updateDoc(doc(db, "products", editingProduct.id), updatedProduct);
    setProducts(products.map((p) => (p.id === editingProduct.id ? { ...updatedProduct, id: editingProduct.id } : p)));
    setEditingProduct(null);
    setNewProduct({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      imageUrl: "",
      category: "",
      subcategory: "",
      variations: [{ size: "", color: "", model: "", stock: 0 }],
      costPrice: "",
      salePrice: "",
      weight: "",
      dimensions: { length: "", width: "", height: "" },
      minStock: 0,
      location: "",
      reservedStock: 0,
    });
  };

  return (
    <div>
      <NavBar />
      <Box sx={{
        p: 4,
        maxWidth: '1440px',
        margin: 'auto',
        backgroundColor: theme.palette.background.default
      }}>
        <Box sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Inventory sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Gerenciamento de Estoque
          </Typography>
        </Box>

        {/* Exibir o total vendido */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Total Vendido: R$ {totalSales.toFixed(2)}
          </Typography>
        </Paper>

        {/* Histórico de Vendas */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Histórico de Vendas
          </Typography>
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            {sales.map((sale) => (
              <Box key={sale.id} sx={{ mb: 2, p: 2, borderBottom: '1px solid #ddd' }}>
                <Typography variant="subtitle1">
                  Data: {new Date(sale.date?.toDate()).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total: R$ {sale.total.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Itens: {sale.items.map((item) => `${item.name} (${item.quantity}x)`).join(', ')}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Formulário de Produtos */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </Typography>

          <Grid container spacing={3}>
            {/* Seção de Informações Básicas */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Informações Básicas</Typography>
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

            {/* Seção de Imagem */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Imagem do Produto</Typography>
              <Box sx={{
                border: '1px dashed',
                borderColor: theme.palette.divider,
                borderRadius: 1,
                p: 2,
                textAlign: 'center'
              }}>
                {newProduct.imageUrl ? (
                  <img
                    src={newProduct.imageUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: theme.shape.borderRadius,
                      cursor: 'pointer'
                    }}
                  />
                ) : (
                  <Box sx={{ color: theme.palette.text.secondary }}>
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

            {/* Seção de Preços e Dimensões */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Preços e Dimensões</Typography>
              <Grid container spacing={2}>
                {["costPrice", "salePrice", "weight"].map((field) => (
                  <Grid item xs={4} key={field}>
                    <TextField
                      label={field === 'costPrice' ? 'Preço de Custo' : field === 'salePrice' ? 'Preço de Venda' : 'Peso'}
                      name={field}
                      value={newProduct[field]}
                      onChange={handleInputChange}
                      fullWidth
                      type="number"
                      InputProps={{
                        startAdornment: field.includes('Price') && 'R$'
                      }}
                      size="small"
                    />
                  </Grid>
                ))}
                {["length", "width", "height"].map((dimension) => (
                  <Grid item xs={4} key={dimension}>
                    <TextField
                      label={`Dimensão (${dimension})`}
                      name={dimension}
                      value={newProduct.dimensions[dimension]}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        dimensions: { ...newProduct.dimensions, [dimension]: e.target.value }
                      })}
                      fullWidth
                      type="number"
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Seção de Variações */}
            <Grid item xs={12}>
              <Box sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="subtitle1">Variações</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addVariation}
                    size="small"
                  >
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
                            type={field === 'stock' ? 'number' : 'text'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {editingProduct ? (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={updateProduct}
                      startIcon={<Edit />}
                    >
                      Atualizar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addProduct}
                    startIcon={<Add />}
                  >
                    Adicionar Produto
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Lista de Produtos */}
        <Typography variant="h6" sx={{ mb: 3 }}>Produtos em Estoque ({products.length})</Typography>
        <Grid container spacing={3}>
          {products.map((product) => {
            const totalStock = product.variations?.reduce((acc, curr) => acc + (curr.stock || 0), 0);
            const stockPercentage = (totalStock / product.minStock) * 100;

            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar
                        src={product.imageUrl}
                        variant="rounded"
                        sx={{ width: 80, height: 80 }}
                      >
                        <PhotoCamera />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{product.name}</Typography>
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ mt: 1 }}
                          color="primary"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stockPercentage}
                        color={totalStock < product.minStock ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1
                      }}>
                        <Typography variant="caption">
                          Estoque: {totalStock}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Mín: {product.minStock}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 1
                    }}>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => startEditing(product)}
                        fullWidth
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => deleteProduct(product.id)}
                        fullWidth
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
      </Box>
      <Footer />
    </div>
  );
}

export default StockManagement;