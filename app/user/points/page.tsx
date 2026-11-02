"use client";
import BarcodeScanner from "@/components/barcode-scanner";
import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import {
  getBarcodeDisabledMessage,
  isBarcodeEnabled,
} from "@/features/scanned-barcodes/helpers/barcode.helper";
import { useHandleScanBarcode } from "@/features/scanned-barcodes/hooks/useHandleScanBarcode";
import { useFetchBarcodeScannerSettings } from "@/features/settings/hooks/queries/useMutateBarcodeScannerSettings";
import { useFetchProductScoreOption } from "@/hooks/fetch-data/useFetchProductScoreOption";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { usePreventInvalidUserProfile } from "@/hooks/usePreventInvalidUserProfile";
import dynamic from "next/dynamic";
import AddProductByTyping from "./_components/AddProductByTyping";
import CollectPointButton from "./_components/CollectPointButton";
import Header from "./_components/Header";
import ProductList from "./_components/ProductList";
import { usePointsPageStore } from "./_store";
import { getUserId } from "@/lib/utils/user.util";

const BarcodeScannerButton = dynamic(
  () => import("./_components/BarcodeScannerButton"),
  { ssr: false }
);

export default function PointsPage() {
  const { user } = useUserProtectedRoute();

  const addProduct = usePointsPageStore((state) => state.addProduct);

  const closeScanner = usePointsPageStore((state) => state.closeScanner);

  const isShowScanner = usePointsPageStore((state) => state.isShowScanner);

  const { data: userInfo, isFetching: isLoadingUserInfo } = useFetchUserInfo(
    getUserId(user)
  );

  const { data: barcodeScannerSettings } = useFetchBarcodeScannerSettings();

  const {
    data: productScoreOption,
    isLoading: isLoadingProductScoreOption,
    isError,
  } = useFetchProductScoreOption();


  const { handleScanProduct } = useHandleScanBarcode({
    productScoreOption: productScoreOption
      ? {
        ...productScoreOption,
        score: (productScoreOption.score ?? 0) * (userInfo?.point_multiplier ?? 1),
      }
      : undefined,
    onAddProduct: addProduct,
    onCloseScanner: closeScanner,
  });



  usePreventInvalidUserProfile(userInfo ?? null, isLoadingUserInfo);

  if (isLoadingProductScoreOption)
    return <Loader label="กำลังดึงข้อมูลคะแนนสินค้า" />;

  if (isError)
    return <h1 className="text-center">ล้มเหลวระหว่างดึงข้อมูลคะแนนสินค้า</h1>;

  return (
    <div className="container mx-auto p-4 relative">
      <Card>
        <Header />
        <CardContent className="space-y-4">
          <ProductList />
          <BarcodeScannerButton
            isDisabled={isBarcodeEnabled({
              productScoreOption,
              userInfo,
              barcodeScannerSettings,
            })}
            disabledMessage={getBarcodeDisabledMessage({
              userInfo: userInfo,
              barcodeScannerSettings: barcodeScannerSettings,
            })}
          />
          {userInfo && productScoreOption && (
            <AddProductByTyping productScoreOption={productScoreOption} point_multiplier={userInfo.point_multiplier ?? 1} />
          )}
          {userInfo && productScoreOption && (
            <CollectPointButton
              userInfo={userInfo}
              productScoreOption={productScoreOption}
            />
          )}
        </CardContent>
      </Card>
      {isShowScanner && (
        <BarcodeScanner onCancel={closeScanner} onScan={handleScanProduct} />
      )}
    </div>
  );
}
