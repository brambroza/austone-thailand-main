import { Alert } from "@/components/ui/alert-message-dialog";
import type { ProductsPage } from "@/features/admin/admin.queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePageControls } from "@/hooks/useTablePagination";
import { apiGet } from "@/lib/utils/api-client.util";
import { fetchAllPages } from "@/lib/utils/fetch-all-pages.util";
import {
  DEFAULT_PAGE_SIZE,
  MAX_ALL_ROWS,
  PAGE_SIZE_ALL,
  chunkItems,
  getPaginationInfo,
} from "@/lib/utils/pagination.util";
import { Product, ProductWithScanner } from "@/models/product.model";
import { ProductType } from "../types/product.type";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  addMultipleProductsAction,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../actions/products.action";
import { convertProductCSVtoProduct } from "../helpers/product.helper";
import {
  PRODUCT_EXPORT_MAX_ROWS,
  buildProductExportRows,
  downloadProductsExcel,
} from "../helpers/product-export.helper";

const PRODUCT_QUERY_KEY = "admin products";
const CSV_BATCH_SIZE = 1000;
// API รับได้สูงสุด 1000 แถวต่อ request
const EXPORT_BATCH_SIZE = 1000;

/** อ่านสินค้าหนึ่งหน้าจาก API */
function fetchProductPage(search: string, page: number, pageSize: number) {
  return apiGet<ProductsPage>("/api/admin/products", {
    page: String(page),
    pageSize: String(pageSize),
    search,
  });
}

/**
 * จัดการตารางสินค้าในหน้า admin: อ่านทีละหน้า เพิ่ม แก้ ลบ นำเข้า และส่งออก Excel
 *
 * @param productTypes - ประเภทสินค้า ใช้แสดงชื่อประเภทในไฟล์ Excel
 */
export function useProductManagement(productTypes: ProductType[] = []) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery.trim());
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [editingProduct, setEditingProduct] =
    useState<ProductWithScanner | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<ProductWithScanner | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const { page, pageSize, setPage, setPageSize } =
    usePageControls(debouncedSearch);

  const { data, isLoading } = useQuery({
    queryKey: [PRODUCT_QUERY_KEY, debouncedSearch, page, pageSize],
    queryFn: () =>
      pageSize === PAGE_SIZE_ALL
        ? fetchAllPages((batchPage, batchSize) =>
            fetchProductPage(debouncedSearch, batchPage, batchSize)
          )
        : fetchProductPage(debouncedSearch, page, pageSize),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const paginationInfo = getPaginationInfo(data?.total ?? 0, page, pageSize);

  // หลังลบแถวสุดท้ายของหน้าสุดท้าย ให้ถอยไปหน้าที่ยังมีข้อมูล
  useEffect(() => {
    if (data && page > paginationInfo.totalPages) {
      setPage(paginationInfo.totalPages);
    }
  }, [data, page, paginationInfo.totalPages, setPage]);

  // คำค้นใหม่อาจได้แถวเกินเพดาน จึงถอยกลับไปแบ่งหน้าปกติ
  useEffect(() => {
    if (pageSize === PAGE_SIZE_ALL && (data?.total ?? 0) > MAX_ALL_ROWS) {
      setPageSize(DEFAULT_PAGE_SIZE);
    }
  }, [data?.total, pageSize, setPageSize]);

  const fetchProducts = () =>
    queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEY] });

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

      let savedRows = 0;

      // แบ่งชุดเพราะ request เดียวบน Vercel มีเพดานขนาดและเวลา
      for (const batch of chunkItems(products, CSV_BATCH_SIZE)) {
        setImportProgress(
          `กำลังบันทึก ${savedRows.toLocaleString("th-TH")} / ${products.length.toLocaleString("th-TH")} แถว`
        );

        const result = await addMultipleProductsAction(batch);

        if (result.isError) {
          throw new Error(
            `บันทึกไปแล้ว ${savedRows} จาก ${products.length} แถว แล้วเกิดข้อผิดพลาด: ${result.error}`
          );
        }

        savedRows += batch.length;
      }

      Alert.success("นำเข้าสินค้าสำเร็จ");
      await fetchProducts();
      setIsImportModalOpen(false);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  /** ส่งออกสินค้าทุกแถวที่ตรงกับคำค้นปัจจุบัน ไม่ใช่แค่หน้าที่แสดง */
  const handleExportExcel = async () => {
    // ใช้คำค้นที่พิมพ์ล่าสุด เผื่อกดก่อน debounce ทำงาน
    const search = searchQuery.trim();

    try {
      setIsExporting(true);
      setExportProgress("กำลังนับจำนวนสินค้า");

      const first = await fetchProductPage(search, 1, EXPORT_BATCH_SIZE);

      if (first.total === 0) {
        Alert.error("ไม่พบสินค้าที่ตรงกับตัวกรอง");
        return;
      }

      if (first.total > PRODUCT_EXPORT_MAX_ROWS) {
        Alert.error(
          `พบ ${first.total.toLocaleString("th-TH")} รายการ ส่งออกได้ครั้งละไม่เกิน ${PRODUCT_EXPORT_MAX_ROWS.toLocaleString("th-TH")} รายการ กรุณาค้นหาให้แคบลง`
        );
        return;
      }

      const rows: ProductWithScanner[] = [...first.rows];

      for (
        let batchPage = 2;
        rows.length < first.total;
        batchPage += 1
      ) {
        setExportProgress(
          `กำลังโหลด ${rows.length.toLocaleString("th-TH")} / ${first.total.toLocaleString("th-TH")} รายการ`
        );

        const result = await fetchProductPage(search, batchPage, EXPORT_BATCH_SIZE);
        if (result.rows.length === 0) break;
        rows.push(...result.rows);
      }

      setExportProgress("กำลังสร้างไฟล์ Excel");

      const productTypeTitles = new Map(
        productTypes.map((productType) => [productType.id, productType.title])
      );

      await downloadProductsExcel(
        buildProductExportRows(rows, productTypeTitles),
        search
      );

      Alert.success(`ส่งออก ${rows.length.toLocaleString("th-TH")} รายการสำเร็จ`);
    } catch (error: any) {
      Alert.error(error.message ?? "ส่งออก Excel ไม่สำเร็จ");
    } finally {
      setIsExporting(false);
      setExportProgress("");
    }
  };

  return {
    products: data?.rows ?? [],
    pagination: { ...paginationInfo, pageSize, setPage, setPageSize },
    allowAllProducts: (data?.total ?? 0) <= MAX_ALL_ROWS,
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
    importProgress,
    deleteConfirmProduct,
    setDeleteConfirmProduct,
    handleDeleteProduct,
    handleUpdateProduct,
    handleAddProduct,
    handleImportCSV,
    isExporting,
    exportProgress,
    handleExportExcel,
  };
}
