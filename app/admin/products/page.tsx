"use client";

import Loading from "@/app/loading";
import AddProductModal from "@/features/products/components/AddProductModal";
import DeleteProductConfirmModal from "@/features/products/components/DeleteProductConfirmModal";
import DeleteProductTypeConfirmModal from "@/features/products/components/DeleteProductTypeConfirmModal";
import EditProductModal from "@/features/products/components/EditProductModal";
import ImportProductsModal from "@/features/products/components/ImportProductsModal";
import ProductHeader from "@/features/products/components/ProductHeader";
import ProductTable from "@/features/products/components/ProductTable";
import ProductTypeHeader from "@/features/products/components/ProductTypeHeader";
import ProductTypeModal from "@/features/products/components/ProductTypeModal";
import ProductTypeTable from "@/features/products/components/ProductTypeTable";
import { useProductManagement } from "@/features/products/hooks/useProductManagement";
import { useProductTypeManagement } from "@/features/products/hooks/useProductTypeManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductType, ProductTypePromotion } from "@/features/products/types/product.type";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";
import { Alert } from "@/components/ui/alert-message-dialog";

type ProductTypePayload =
  | { id: number; title: string }
  | { title: string };

type SavePayload = {
  productType: ProductTypePayload;
  promotions?: ProductTypePromotion[]; // ใช้ type จริงของคุณ
};

export default function ProductPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [reloadKeys, setReloadKeys] = useState(0);


  const {
    products,
    isLoading: isLoadingProducts,
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
  } = useProductManagement();

  // Product Type Management
  const {
    productTypes,
    productTypesPromotions,
    isLoading: isLoadingProductTypes,
    searchQuery: productTypeSearchQuery,
    setSearchQuery: setProductTypeSearchQuery,
    isAddModalOpen: isProductTypeAddModalOpen,
    setIsAddModalOpen: setProductTypeAddModalOpen,
    editingProductType,
    setEditingProductType,
    deleteConfirmProductType,
    setDeleteConfirmProductType,
    isProcessing,
    handleAddProductType,
    handleUpdateProductType,
    handleDeleteProductType,
    handleUpdateProductTypePromotions,
  } = useProductTypeManagement();

  if (isLoadingProducts || isLoadingProductTypes) return <Loading />;

  const handleProductTypeSave = async ({ productType, promotions }: SavePayload) => {
    // 1) Save product type (add/update)
    const res = "id" in productType
      ? await handleUpdateProductType(productType as ProductType)
      : await handleAddProductType(productType.title);

/*     console.log("promotions?.length", promotions?.length);
    console.log("res?.length", res); */
    if (!res.ok || !res.data) return false;

    const savedProductType = res.data;


/*     console.log("promotions?.length", promotions?.length); */
    if (promotions?.length) {
      try {
        // TODO: call action ของคุณ เช่น:
        await handleUpdateProductTypePromotions(savedProductType.id, promotions);
        // Alert.success("บันทึกโปรโมชันสำเร็จ");
      } catch (e: any) {
        Alert.error(e.message ?? "บันทึกโปรโมชันไม่สำเร็จ");
        return false;
      }
    }

    return true;


  };




  const handleConfirmDeleteProductType = async () => {
    const result = await handleDeleteProductType();
    return result || false;
  };

  const filteredProducts = products.filter(
    (product) =>
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Product Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
        isImporting={isImporting}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}

      <DeleteProductConfirmModal
        isOpen={!!deleteConfirmProduct}
        onClose={() => setDeleteConfirmProduct(null)}
        onConfirm={handleDeleteProduct}
        isDeleting={deletingProductId === deleteConfirmProduct?.id}
        productId={deleteConfirmProduct?.id || ""}
      />

      <ProductTypeModal
        isOpen={isProductTypeAddModalOpen || !!editingProductType}
        onClose={() => {
          setProductTypeAddModalOpen(false);
          setEditingProductType(null);
        }}
        onSave={handleProductTypeSave}
        productType={editingProductType}
        isProcessing={isProcessing}
        key={reloadKeys}
        productTypePromotions={productTypesPromotions ?? []}

      />

      <DeleteProductTypeConfirmModal
        isOpen={!!deleteConfirmProductType}
        onClose={() => setDeleteConfirmProductType(null)}
        onConfirm={handleConfirmDeleteProductType}
        isProcessing={isProcessing}
        productType={deleteConfirmProductType}
      />

      <div className="space-y-6">
        <h1 className="text-xl font-bold">ระบบจัดการสินค้า</h1>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">สินค้า</TabsTrigger>
            <TabsTrigger value="product-types">ประเภทสินค้า</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <ProductHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onImportClick={() => setIsImportModalOpen(true)}
              onAddClick={() => setIsAddModalOpen(true)}
            />

            <ProductTable
              products={paginatedProducts}
              onEdit={setEditingProduct}
              onDelete={setDeleteConfirmProduct}
              deletingProductId={deletingProductId}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="product-types" className="space-y-4">
            <ProductTypeHeader
              searchQuery={productTypeSearchQuery}
              onSearchChange={setProductTypeSearchQuery}
              onAddClick={() => {
                setReloadKeys((prev) => prev + 1);
                setProductTypeAddModalOpen(true);
              }}
            />

            <ProductTypeTable
              productTypes={productTypes}
              onEdit={(e) => {
                setReloadKeys((prev) => prev + 1);
                setEditingProductType(e);
              }}
              onDelete={setDeleteConfirmProductType}
              isProcessing={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
