import { useState } from "react";
import { Alert } from "@/components/ui/alert-message-dialog";
import { ProductType, ProductTypePromotion } from "../types/product.type";
import { useFetchAllProductTypes, useFetchAllProductTypesPromotions } from "./queries/useFetchAllProductTypes";
import {
  createProductType,
  deleteProductType,
  updateProductType,
  upsertProductTypePromotions,
} from "../actions/product-types.action";
import { useQueryClient } from "@tanstack/react-query";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";

export function useProductTypeManagement() {
  const queryClient = useQueryClient();
  const {
    data: productTypes = [],
    isLoading,
    refetch,
  } = useFetchAllProductTypes();

  const {
    data: productTypesPromotions = [],
    isLoading : isLoadingPromotions,
    refetch : refetchPromotions,
  } = useFetchAllProductTypesPromotions();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingProductType, setEditingProductType] =
    useState<ProductType | null>(null);
  const [deleteConfirmProductType, setDeleteConfirmProductType] =
    useState<ProductType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* const handleAddProductType = async (title: string) => {
    try {
      setIsProcessing(true);
      const result = await createProductType({ title });
      const { isError, error } =
        SafeActionUtil.getData<ServerActionResponse<ProductType>>(result);

      if (isError) {
        throw new Error(error);
      }

      Alert.success("เพิ่มประเภทสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["fetch-all-product-types"] });
      return true;
    } catch (error: any) {
      Alert.error(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
 */

  const handleAddProductType = async (
    title: string,
    canCollectPoints = true
  ) => {
    try {
      setIsProcessing(true);

      const result = await createProductType({
        title,
        can_collect_points: canCollectPoints,
      });
      const { isError, error, data } =
        SafeActionUtil.getData<ServerActionResponse<ProductType>>(result);

      if (isError) throw new Error(error);

      Alert.success("เพิ่มประเภทสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["fetch-all-product-types"] });

      return { ok: true as const, data }; // ✅ ได้ ProductType (มี id)
    } catch (error: any) {
      Alert.error(error.message);
      return { ok: false as const, error: error.message as string };
    } finally {
      setIsProcessing(false);
    }
  };
  /* const handleUpdateProductType = async (productType: ProductType) => {
    try {
      setIsProcessing(true);
      const result = await updateProductType(productType);
      const { isError, error } =
        SafeActionUtil.getData<ServerActionResponse<ProductType>>(result);

      if (isError) {
        throw new Error(error);
      }

      Alert.success("แก้ไขประเภทสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["fetch-all-product-types"] });
      return true;
    } catch (error: any) {
      Alert.error(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
 */

  const handleUpdateProductType = async (productType: ProductType) => {
    try {
      setIsProcessing(true);

      const { data, isError, error } = await updateProductType(productType);


      if (isError) throw new Error(error);

      Alert.success("แก้ไขประเภทสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["fetch-all-product-types"] });

      return { ok: true as const, data };
    } catch (error: any) {
      Alert.error(error.message);
      return { ok: false as const, error: error.message as string };
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDeleteProductType = async () => {
    if (!deleteConfirmProductType) return;

    try {
      setIsProcessing(true);
      const result = await deleteProductType(deleteConfirmProductType.id);
      const { isError, error } =
        SafeActionUtil.getData<ServerActionResponse<null>>(result);

      if (isError) {
        throw new Error(error);
      }

      Alert.success("ลบประเภทสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["fetch-all-product-types"] });
      setDeleteConfirmProductType(null);
      return true;
    } catch (error: any) {
      Alert.error(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };


  const handleUpdateProductTypePromotions = async (id: number, promotions: ProductTypePromotion[]) => {
    try {
      setIsProcessing(true);



      if (promotions?.length) {
        const promoRes = await upsertProductTypePromotions({
          productTypeId: id,
          promotions,
          updatedByUserId: null,
          syncMissing: true,
        });

        if (promoRes.isError) {
          Alert.error(promoRes.error);
          return false;
        }
      }

      return true;
    } catch (error: any) {
      Alert.error(error.message);
      return { ok: false as const, error: error.message as string };
    } finally {
      setIsProcessing(false);
    }
  };



  const filteredProductTypes = (productTypes || []).filter((type) =>
    type.title.toLowerCase().includes(searchQuery.toLowerCase())

  );



  return {
    productTypes: filteredProductTypes,
    productTypesPromotions  , 
    isLoading,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    editingProductType,
    setEditingProductType,
    deleteConfirmProductType,
    setDeleteConfirmProductType,
    isProcessing,
    handleAddProductType,
    handleUpdateProductType,
    handleDeleteProductType,
    refetchProductTypes: refetch,
    handleUpdateProductTypePromotions,
  };
}
