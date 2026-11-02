import {
  insertScannedBarcodes,
  isBarcodeAlreadyScannedAction,
} from "@/actions/queries/scanned-barcodes.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { User } from "@/models/user.model";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePointsPageStore } from "../_store";
import { Product } from "../_type";

type Props = {
  userInfo: User;
  productScoreOption: ProductScoreOption;
};

const CollectPointButton = ({ userInfo, productScoreOption }: Props) => {
  const [isCollecting, setIsCollecting] = useState(false);

  const products = usePointsPageStore((state) => state.products);

  const resetStore = usePointsPageStore((state) => state.resetStore);

  const addUsedProductId = usePointsPageStore(
    (state) => state.addUsedProductId
  );

  const router = useRouter();

  async function handleCollectUserPoints() {
    try {
      setIsCollecting(true);

      const checkedProductResults = await Promise.all(
        products.map((product) => isBarcodeAlreadyScanned(product.id))
      );

      if (checkedProductResults.some((result) => result.isScanned)) {
        checkedProductResults.forEach((result) => {
          if (result.isScanned) {
            addUsedProductId(result.productId);
          }
        });
        throw new Error("บาร์โค้ดถูกใช้ไปแล้ว");
      }

      const { isError, error } = await insertScannedBarcodes(
        serializeScannedBarcodes(userInfo, productScoreOption, products)
      );

      if (isError) throw new Error(error);

      Alert.success("สะสมแต้มสำเร็จ");

      resetStore();

      router.push("/user/history");
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsCollecting(false);
    }
  }
  return (
    <Button
      loading={isCollecting}
      disabled={isCollecting || products.length <= 0}
      onClick={handleCollectUserPoints}
      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
    >
      บันทึกข้อมูลเพื่อสะสมแต้ม
    </Button>
  );
};

function serializeScannedBarcodes(
  userInfo: User,
  productScoreOption: ProductScoreOption,
  products: Product[]
) {
  return products.map((p) => ({
    user_id: userInfo.user_id,
    product_id: p.id,
    product_score_option_id: productScoreOption.id,
    point_multiplier: p.points,
  }));
}

async function isBarcodeAlreadyScanned(productId: string) {
  const { data, isError, error } = await isBarcodeAlreadyScannedAction({
    product_id: productId,
  });

  if (isError) throw new Error(error);

  return { isScanned: data ?? false, productId: productId };
}

export default CollectPointButton;
