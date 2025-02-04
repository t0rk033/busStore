import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography, TextField, Grid } from "@mui/material";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

function StockManagement() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    subcategory: "",
    variations: [{ size: "", color: "", model: "", stock: 0 }], // Campo de variações
    costPrice: "",
    salePrice: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    minStock: 0,
    location: "",
    reservedStock: 0,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // 🔥 Buscar produtos do Firestore ao carregar a página
  useEffect(() => {
    async function fetchProducts() {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        variations: doc.data().variations || [], // Garantir que variations exista
      }));
      setProducts(productsData);
    }
    fetchProducts();
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
      variations: newProduct.variations || [], // Garantir que variations exista
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
      variations: product.variations || [], // Garantir que variations exista
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
      variations: newProduct.variations || [], // Garantir que variations exista
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
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
        <Typography variant="h4" gutterBottom>Gerenciamento de Estoque</Typography>

        {/* Formulário de Adição/Edição */}
        <Grid container spacing={2}>
          {["sku", "barcode", "name", "description", "imageUrl", "category", "subcategory", "costPrice", "salePrice", "weight"].map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={newProduct[field]}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          ))}
          {["length", "width", "height"].map((dimension) => (
            <Grid item xs={4} key={dimension}>
              <TextField
                label={`Dimensão (${dimension})`}
                name={dimension}
                value={newProduct.dimensions[dimension]}
                onChange={(e) => setNewProduct({ ...newProduct, dimensions: { ...newProduct.dimensions, [dimension]: e.target.value } })}
                fullWidth
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">Variações</Typography>
            {newProduct.variations.map((variation, index) => (
              <Grid container spacing={2} key={index}>
                {["size", "color", "model", "stock"].map((field) => (
                  <Grid item xs={3} key={field}>
                    <TextField
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={variation[field]}
                      onChange={(e) => handleVariationChange(index, field, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
            <Button onClick={addVariation} style={{ marginTop: "10px" }}>Adicionar Variação</Button>
          </Grid>
        </Grid>

        <div style={{ marginTop: "10px" }}>
          {editingProduct ? (
            <Button variant="contained" color="secondary" onClick={updateProduct}>Atualizar</Button>
          ) : (
            <Button variant="contained" color="primary" onClick={addProduct}>Adicionar</Button>
          )}
        </div>

        {/* Lista de Produtos */}
        <Grid container spacing={2} style={{ marginTop: "20px" }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body1">SKU: {product.sku}</Typography>
                  <Typography variant="body1">Preço de Venda: R$ {Number(product.salePrice).toFixed(2)}</Typography>
                  <Typography variant="body1">
                    Estoque Total: {product.variations?.reduce((acc, curr) => acc + (curr.stock || 0), 0)}
                  </Typography>
                  {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: "100px", marginTop: "10px" }} />}
                  <div style={{ marginTop: "10px" }}>
                    <Button variant="outlined" color="primary" onClick={() => startEditing(product)} style={{ marginRight: "5px" }}>Editar</Button>
                    <Button variant="outlined" color="secondary" onClick={() => deleteProduct(product.id)}>Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
      <Footer />
    </div>
  );
}

export default StockManagement;