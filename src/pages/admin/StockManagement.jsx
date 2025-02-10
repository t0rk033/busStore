import React, { useState, useEffect } from "react";
import {
  Button, Card, CardContent, Typography, TextField, Grid,
  Box, Chip, Paper, Avatar, useTheme, LinearProgress, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Divider, Badge
} from "@mui/material";
import { 
  Add, Edit, Delete, PhotoCamera, Inventory, LocalShipping,
  ExpandMore, Search, TrendingUp, Label, Description, Paid,
  Scale, Straighten, Storage, Warning, CheckCircle, Cancel
} from "@mui/icons-material";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { db } from "../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs } from "firebase/firestore";
import ShippedOrders from "./ShippedOrders";
import styles from './StockManagement.module.css';
function StockManagement() {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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

  // =================== Firebase Operations ===================
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        variations: doc.data().variations || []
      }));
      setProducts(productsData);
    });

    const unsubscribeSales = onSnapshot(collection(db, "sales"), async (snapshot) => {
      const salesData = await Promise.all(snapshot.docs.map(async (doc) => {
        const saleData = doc.data();
        const clientQuery = await getDocs(collection(db, "sales", doc.id, "client"));
        const clientData = clientQuery.docs.map(clientDoc => clientDoc.data())[0];

        let addressData = {};
        if (clientQuery.docs.length > 0) {
          const addressQuery = await getDocs(collection(db, "sales", doc.id, "client", clientQuery.docs[0].id, "address"));
          addressData = addressQuery.docs.map(addressDoc => addressDoc.data())[0];
        }

        return {
          id: doc.id,
          ...saleData,
          date: saleData.date?.toDate(),
          client: clientData,
          address: addressData
        };
      }));

      setSales(salesData);
      setTotalSales(salesData.reduce((acc, sale) => acc + sale.total, 0));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, []);

  // =================== Product Functions ===================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const addVariation = () => {
    setNewProduct(prev => ({
      ...prev,
      variations: [...prev.variations, { size: "", color: "", model: "", stock: 0 }]
    }));
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...newProduct.variations];
    updatedVariations[index][field] = value;
    setNewProduct(prev => ({ ...prev, variations: updatedVariations }));
  };

  const saveProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        costPrice: parseFloat(newProduct.costPrice) || 0,
        salePrice: parseFloat(newProduct.salePrice) || 0,
        weight: parseFloat(newProduct.weight) || 0,
        variations: newProduct.variations.map(v => ({
          ...v,
          stock: parseInt(v.stock, 10) || 0
        })),
        dimensions: {
          length: parseFloat(newProduct.dimensions.length) || 0,
          width: parseFloat(newProduct.dimensions.width) || 0,
          height: parseFloat(newProduct.dimensions.height) || 0
        }
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        setProducts(prev => 
          prev.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p)
        );
      } else {
        const docRef = await addDoc(collection(db, "products"), productData);
        setProducts(prev => [...prev, { ...productData, id: docRef.id }]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      variations: product.variations || []
    });
  };

  // =================== Order Functions ===================
  const markAsShipped = async (saleId) => {
    try {
      await updateDoc(doc(db, "sales", saleId), { shipped: true });
      setSales(prev => prev.map(sale => sale.id === saleId ? { ...sale, shipped: true } : sale));
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // =================== Helper Functions ===================
  const resetForm = () => {
    setNewProduct({
      sku: "", barcode: "", name: "", description: "", imageUrl: "",
      category: "", subcategory: "", variations: [{ size: "", color: "", model: "", stock: 0 }],
      costPrice: "", salePrice: "", weight: "", dimensions: { length: "", width: "", height: "" },
      minStock: 0, location: "", reservedStock: 0
    });
    setEditingProduct(null);
  };

  // =================== Render ===================
  return (
    <div className={styles.container}>
      <NavBar />
      
      
      <Box sx={{ 
        p: 4, 
        maxWidth: 1440, 
        margin: 'auto', 
        bgcolor: 'background.default',
        '& .MuiCard-root': { borderRadius: 4 },
        '& .MuiPaper-root': { borderRadius: 4 }
      }}>
        
        {/* Dashboard Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Inventory sx={{ 
              fontSize: 40, 
              color: theme.palette.primary.main,
              bgcolor: theme.palette.primary.light,
              p: 1.5,
              borderRadius: 4
            }}/>
            <Typography variant="h4" fontWeight="700">Gestão de Estoque</Typography>
          </Box>
          
          <TextField
            variant="outlined"
            placeholder="Pesquisar produtos..."
            InputProps={{
              startAdornment: <Search sx={{ color: 'action.active', mr: 1 }}/>,
            }}
            sx={{ width: 300 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main }}/>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Vendas Totais</Typography>
                  <Typography variant="h4" fontWeight="700">R$ {totalSales.toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Storage sx={{ fontSize: 40, color: theme.palette.info.main }}/>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Produtos Cadastrados</Typography>
                  <Typography variant="h4" fontWeight="700">{products.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Warning sx={{ fontSize: 40, color: theme.palette.error.main }}/>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Produtos com Baixo Estoque</Typography>
                  <Typography variant="h4" fontWeight="700">
                    {products.filter(p => p.variations.reduce((acc, curr) => acc + curr.stock, 0) < p.minStock).length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Orders Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" fontWeight="600">
                Pedidos Pendentes ({sales.filter(s => !s.shipped).length})
              </Typography>
              <Chip 
                label="Atualizado agora" 
                size="small" 
                color="success" 
                variant="outlined"
                icon={<CheckCircle fontSize="small"/>}
              />
            </Box>
            
            <Grid container spacing={2}>
              {sales.filter(s => !s.shipped).map(sale => (
                <Grid item xs={12} key={sale.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          #{sale.id.slice(0,8).toUpperCase()} • {sale.date?.toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {sale.client?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {sale.items.length} itens • R$ {sale.total.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        startIcon={<LocalShipping />}
                        onClick={() => markAsShipped(sale.id)}
                        sx={{ borderRadius: 3 }}
                      >
                        Marcar como Enviado
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        <ShippedOrders/>
        {/* Product Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Accordion defaultExpanded elevation={0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" fontWeight="600">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </Typography>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Seções do formulário melhoradas com ícones e divisores */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Label fontSize="small" color="primary"/>
                      <Typography variant="subtitle1" color="primary">Informações Básicas</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {["sku", "barcode", "name", "category"].map((field) => (
                        <Grid item xs={12} md={6} key={field}>
                          <TextField
                            label={field === 'sku' ? 'SKU' : field.charAt(0).toUpperCase() + field.slice(1)}
                            name={field}
                            value={newProduct[field]}
                            onChange={handleInputChange}
                            fullWidth
                            size="small"
                            variant="filled"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }}/>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Paid fontSize="small" color="primary"/>
                      <Typography variant="subtitle1" color="primary">Preços e Dimensões</Typography>
                    </Box>
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
                        InputProps={{ startAdornment: field.includes('Price') && 'R$' }}
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
                        onChange={e => setNewProduct(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, [dim]: e.target.value }
                        }))}
                        fullWidth
                        type="number"
                        size="small"
                      />
                    </Grid>
                  ))}
                </Grid>
                <Grid item xs={12}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">Variações</Typography>
                    <Button variant="outlined" startIcon={<Add />} onClick={addVariation} size="small">
                      Adicionar Variação
                    </Button>
                  </Box>
                  {newProduct.variations.map((variation, index) => (
                    <Paper key={index} elevation={1} className={styles.variationCard}>
                      <Grid container spacing={2}>
                        {["size", "color", "model", "stock"].map((field) => (
                          <Grid item xs={3} key={field}>
                            <TextField
                              label={field.charAt(0).toUpperCase() + field.slice(1)}
                              value={variation[field]}
                              onChange={e => handleVariationChange(index, field, e.target.value)}
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

                  </Grid>

                  {/* Seção de Ações do Formulário */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: 'flex-end',
                      borderTop: 1,
                      borderColor: 'divider',
                      pt: 3
                    }}>
                      {editingProduct && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={resetForm}
                        >
                          Cancelar Edição
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={editingProduct ? <CheckCircle /> : <Add />}
                        onClick={saveProduct}
                        sx={{ minWidth: 200 }}
                      >
                        {editingProduct ? 'Confirmar Alterações' : 'Adicionar Produto'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Product List */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Lista de Produtos
              <Chip 
                label={`${products.length} itens`} 
                size="small" 
                sx={{ ml: 2, bgcolor: 'action.selected' }} 
              />
            </Typography>
            
            <Grid container spacing={3}>
              {products.map(product => {
                const totalStock = product.variations?.reduce((acc, curr) => acc + (curr.stock || 0), 0);
                const isLowStock = totalStock < product.minStock;

                return (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card variant="outlined" sx={{ 
                      position: 'relative',
                      '&:hover': { boxShadow: 4 }
                    }}>
                      {isLowStock && (
                        <Chip
                          label="Baixo Estoque"
                          color="error"
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            right: 16, 
                            top: 16,
                            fontWeight: 600
                          }}
                        />
                      )}
                      
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Avatar 
                            src={product.imageUrl} 
                            variant="rounded" 
                            sx={{ 
                              width: 80, 
                              height: 80,
                              bgcolor: 'background.paper'
                            }}
                          >
                            <PhotoCamera sx={{ color: 'text.disabled' }}/>
                          </Avatar>
                          
                          <Box>
                            <Typography variant="subtitle1" fontWeight="600">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              SKU: {product.sku}
                            </Typography>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              sx={{ 
                                mt: 1,
                                bgcolor: 'primary.light',
                                color: 'primary.dark'
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(totalStock / (product.minStock || 1)) * 100}
                            color={isLowStock ? 'error' : 'primary'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: 1
                          }}>
                            <Typography variant="caption">
                              Estoque: <strong>{totalStock}</strong>
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Mín: {product.minStock}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          '& .MuiButton-root': {
                            flex: 1,
                            py: 1
                          }
                        }}>
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => startEditing(product)}
                            color="info"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => deleteProduct(product.id)}
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
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </div>
  );

}

export default StockManagement;





