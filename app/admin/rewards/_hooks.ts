import { addNewReward, updateReward, updateRewardNew } from "@/actions/queries/reward.action";
import { uploadRewardImage } from "@/actions/storage/reward-storage.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { Reward } from "./_components/types";
import { RewardSchema } from "@/models/reward.model";

type Params = {
  onSetLoadingMessage: (message: string) => void;
  onRefreshRewards: () => void;
  onSetIsLoading: (isLoading: boolean) => void;
  onSetIsFormOpen: (isFormOpen: boolean) => void;
  onSetEditingReward: (reward: Reward | null) => void;
  editingReward: Reward | null;
};

export function useManageRewardAction({
  onSetLoadingMessage,
  onRefreshRewards,
  onSetIsLoading,
  onSetIsFormOpen,
  onSetEditingReward,
  editingReward,
}: Params) {
  async function handleAddNewReward(reward: Reward) {
    if (!reward.image) {
      Alert.error("กรุณาเลือกรูปภาพ");
      return;
    }

    const payload = {
      title: reward.name,
      description: reward.description,
      quantity: reward.amount,
      required_score: reward.points,
  /*     expired_at: reward.expirationDate || new Date(),
      available_at: (reward.availableAt || new Date()).toISOString(), */
      expired_at: reward.expirationDate || new Date(),
      available_at: formatDateOnly(reward.availableAt) || new Date().toISOString(), // reward.availableAt || new Date(),

      is_visible: reward.isActive ?? true,
      is_alert_enable: reward.isAlertEnabled ?? false,
    };

    const schema = RewardSchema.omit({ id: true, updated_at: true, created_at: true });
    const parsed = schema.safeParse(payload);


    console.log("local parse:", schema.safeParse(payload)); // ✅ ผ่าน

    const serialized = JSON.parse(JSON.stringify(payload)); // Date -> string
    console.log("after serialize:", schema.safeParse(serialized));

    if (!parsed.success) {
      console.table(
        parsed.error.issues.map(i => ({
          path: i.path.join("."),
          message: i.message,
          code: i.code,
        }))
      );
      return; // หยุดก่อนเรียก action
    }


    const actionResult = await addNewReward(payload);



    SafeActionUtil.validateErrors(actionResult);

    const savedReward = SafeActionUtil.getData<Reward>(actionResult);


    onSetLoadingMessage("กำลังอัพโหลดรูปภาพ...");

    if (!reward.image.startsWith("http")) {
      await uploadRewardImage({
        base64: reward.image,
        path: `${savedReward.id}.png`,
      });
    }

    Alert.success("เพิ่มรางวัลสำเร็จ");
  }
  const formatDateOnly = (value: Date | string | null | undefined) => {
    if (!value) return undefined;

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return undefined;

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };

  async function handleUpdateReward(reward: Reward) {
    if (!reward.image) {
      Alert.error("กรุณาเลือกรูปภาพ");
      return;
    }

    const actionResult = await updateReward({
      id: reward.id,
      title: reward.name,
      description: reward.description,
      quantity: reward.amount,
      expired_at: reward.expirationDate || new Date(),
      available_at: formatDateOnly(reward.availableAt) || new Date().toISOString(), // reward.availableAt || new Date(),

      is_visible: reward.isActive,
      is_alert_enable: reward.isAlertEnabled,
    });

    SafeActionUtil.validateErrors(actionResult);

    const savedReward = SafeActionUtil.getData<Reward>(actionResult);

    if (!reward.image.startsWith("http")) {
      onSetLoadingMessage("กำลังอัพโหลดรูปภาพ...");
      await uploadRewardImage({
        base64: reward.image,
        path: `${savedReward.id}.png`,
      });
    }

    Alert.success("บันทึกข้อมูลสำเร็จ");
  }

  const handleToggleStatus = async (reward: Reward) => {
    try {
      await updateReward({ id: reward.id, is_visible: !reward.isActive });
      onRefreshRewards();
      Alert.success("สถานะของรางวัลถูกเปลี่ยนแล้ว");
    } catch (error) {
      Alert.error("ไม่สามารถเปลี่ยนสถานะของรางวัลได้");
    }
  };

  const handleToggleAlertEnable = async (reward: Reward) => {
    try {


      await updateRewardNew({ id: reward.id, is_alert_enable: !reward.isAlertEnabled });
      onRefreshRewards();
      Alert.success("สถานะแจ้งเตือนของรางวัลถูกเปลี่ยนแล้ว");
    } catch (error) {
      Alert.error("ไม่สามารถเปลี่ยนสถานะแจ้งเตือนของรางวัลได้");
    }
  };

  const handleSubmit = async (reward: Reward) => {
    try {

      const isInEditMode = Boolean(editingReward?.id);

      onSetIsLoading(true);

      onSetLoadingMessage("กำลังบันทึกข้อมูลของรางวัล...");


      if (isInEditMode) {
        await handleUpdateReward(reward);
      } else {


        await handleAddNewReward(reward);
      }

      onRefreshRewards();

      onSetIsFormOpen(false);

      onSetEditingReward(null);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      onSetIsLoading(false);
    }
  };

  return {
    handleAddNewReward,
    handleUpdateReward,
    handleToggleStatus,
    handleSubmit,
    handleToggleAlertEnable,
  };
}
