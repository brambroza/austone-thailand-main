import { Alert } from "@/components/ui/alert-message-dialog";
import { Product, ProductWithScanner } from "@/models/product.model";
import { useEffect, useState } from "react";
import {
  addMultipleProductsAction,
  createProduct,
  deleteProduct,
  getAllProductsWithScannerAction,
  updateProduct,
} from "../actions/products.action";
import { convertProductCSVtoProduct } from "../helpers/product.helper";

export function useProductManagement() {
  const [products, setProducts] = useState<ProductWithScanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [editingProduct, setEditingProduct] =
    useState<ProductWithScanner | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<ProductWithScanner | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, isError, error } = await getAllProductsWithScannerAction();

      if (isError) {
        Alert.error(error);
        return;
      }

      setProducts(data ?? []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;

    try {
      setDeletingProductId(deleteConfirmProduct.id);
      const result = await deleteProduct({ id: deleteConfirmProduct.id });

      if (result.isError) {
        throw new Error(result.error);
      }

      Alert.success("ลบสินค้าสำเร็จ");
      await fetchProducts();
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setDeletingProductId(null);
      setDeleteConfirmProduct(null);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Partial<Product>) => {
    try {
      const result = await updateProduct(updatedProduct.id!, updatedProduct);

      if (result.isError) {
        throw new Error(result.error);
      }

      Alert.success("แก้ไขข้อมูลสินค้าสำเร็จ");
      await fetchProducts();
    } catch (error: any) {
      Alert.error(error.message);
      throw error;
    }
  };

  const handleAddProduct = async (
    newProduct: Omit<Product, "created_at" | "updated_at">
  ) => {
    try {
      const result = await createProduct(newProduct);

      if (result.isError) {
        throw new Error(result.error);
      }

      Alert.success("เพิ่มสินค้าสำเร็จ");
      await fetchProducts();
    } catch (error: any) {
      Alert.error(error.message);
      throw error;
    }
  };

  const handleImportCSV = async (file: File) => {
    try {
      setIsImporting(true);
      const text = await file.text();
      const rows = text.split("\n").slice(1);

      const products = rows
        .filter((row) => row.trim())
        .map(convertProductCSVtoProduct);

        console.log("products inport: >>>" , products.length);  

      const result = await addMultipleProductsAction(products);

      if (result?.isError) {
        throw new Error(result.error);
      }

      Alert.success("นำเข้าสินค้าสำเร็จ");
      await fetchProducts();
      setIsImportModalOpen(false);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    products: filteredProducts,
    isLoading,
    searchQuery,
    setSearchQuery,
    deletingProductId,
    editingProduct,
    setEditingProduct,
    isAddModalOpen,
    setIsAddModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isImporting,
    deleteConfirmProduct,
    setDeleteConfirmProduct,
    handleDeleteProduct,
    handleUpdateProduct,
    handleAddProduct,
    handleImportCSV,
  };
}
