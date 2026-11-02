import { Alert } from "@/components/ui/alert-message-dialog";
import { create } from "zustand";
import { Product } from "./_type";

interface PointsPageState {
  products: Product[];
  usedProductIds: string[];
  isShowScanner: boolean;
}

interface PointsPageAction {
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetStore: () => void;
  addUsedProductId: (id: string) => void;
  resetUsedProductIds: () => void;
  showScanner: () => void;
  closeScanner: () => void;
}

type PointsPageStore = PointsPageState & PointsPageAction;

const initialState: PointsPageState = {
  products: [],
  usedProductIds: [],
  isShowScanner: false,
};

export const usePointsPageStore = create<PointsPageStore>((set) => ({
  ...initialState,
  setProducts: (products) => set({ products }),
  addProduct: (newProduct) =>
    set((state) => {
     
      const hasAlreadyBeenScanned = state.products.some(
        (product) => newProduct.id === product.id
      );

      if (hasAlreadyBeenScanned) {
        return { products: state.products };
      }

      Alert.success("สแกนสำเร็จ");


      return {
        products: [...state.products, newProduct],
      };
    }),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
  addUsedProductId: (id) =>
    set((state) => ({ usedProductIds: [...state.usedProductIds, id] })),
  resetUsedProductIds: () => set({ usedProductIds: [] }),
  resetStore: () => set(initialState),
  showScanner: () => set({ isShowScanner: true }),
  closeScanner: () => set({ isShowScanner: false }),
}));
