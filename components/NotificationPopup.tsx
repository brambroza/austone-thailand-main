"use client";
import { useState, useEffect } from "react";
import { Bell, Gift, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserProtectedRoute } from "./protected/UserProtectedRoute";
import { getUserId } from "@/lib/utils/user.util";
import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";

type ExpiringPoints = {
    total_score_soon_expire: number;
    expire_message: string;
};

export default function NotificationPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useUserProtectedRoute();
    const router = useRouter();

    const [scores, setScores] = useState<{
        total_score_soon_expire: number;
        expire_message: string;
    } | null>(null);

    const [rewards, setRewards] = useState<any[]>([]);




    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                // ดึงคะแนนและ reward ใหม่พร้อมกัน
                const [{ data: expiringPoints }, { data: newRewards }] = await Promise.all([
                    apiGet<ServerActionResponse<ExpiringPoints>>(
                        `/api/users/${encodeURIComponent(getUserId(user))}/expiring-points`
                    ),
                    apiGet<ServerActionResponse<any[]>>("/api/rewards/alerts"),
                ]);
                setScores(expiringPoints ?? null);
                setRewards(newRewards ?? []);

                // ✅ เงื่อนไขการแสดง popup
                if ((expiringPoints && expiringPoints.total_score_soon_expire > 0) || (newRewards && newRewards.length > 0)) {
                    const timer = setTimeout(() => setIsVisible(true), 2000);
                    return () => clearTimeout(timer);
                }
            } catch (error) {
                console.error("❌ Error fetching notification data:", error);
            }
        }

        fetchData();
    }, [user]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-[92%] sm:w-[80%] max-w-md max-h-[80vh] overflow-y-auto bg-[#FFF9E5] shadow-2xl rounded-2xl border border-yellow-200 p-5 sm:p-6 animate-popIn">




                {/* ส่วนหัว */}
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#FFF9E5] py-2">
                    <Bell className="text-yellow-500 w-6 h-6 animate-pulse" />
                    <h2 className="text-lg font-bold text-slate-800">แจ้งเตือน</h2>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* เนื้อหา */}
                <div className="space-y-4 text-sm text-slate-700">
                    {/* ✅ โปรโมชั่นใหม่ */}
                    {rewards.length > 0 && (
                        <div className="bg-yellow-50 rounded-xl p-3 shadow-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <Gift className="text-yellow-500 w-6 h-6 mt-1" />
                                <div>
                                    <p className="font-medium text-slate-800">🎁 ของรางวัลใหม่</p>
                                    <p>มีของรางวัลใหม่ {rewards.length} รายการในเดือนนี้</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {rewards.map((reward) => (
                                    <div
                                        key={reward.id}
                                        className="flex flex-col sm:flex-row gap-3 border border-yellow-100 bg-white rounded-xl p-3"
                                    >
                                        {/* Image Container */}
                                        <div className="w-full sm:w-28 h-28 flex-shrink-0">
                                            {reward.image_url ? (
                                                <img
                                                    src={reward.image_url}
                                                    alt={reward.title}
                                                    className="w-full h-full object-cover rounded-lg border border-yellow-200"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded-lg" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <p className="font-semibold text-yellow-600 text-base line-clamp-2 ">
                                                    {reward.title}
                                                </p>
                                                {reward.description && (
                                                    <p className="text-xs text-gray-600 line-clamp-3 mt-1">
                                                        {reward.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* ✅ Progress bar */}
                                            <div className="mt-2">
                                                <div className="flex justify-between text-[11px] text-gray-500">
                                                    <span>คะแนนที่ต้องใช้</span>
                                                    <span>{reward.required_score.toLocaleString()} คะแนน</span>
                                                </div>
                                                <div className="w-full h-2 bg-yellow-100 rounded-full mt-1">
                                                    <div
                                                        className="h-2 bg-yellow-400 rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (reward.required_score / 1000) * 100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ✅ คะแนนใกล้หมดอายุ */}
                    {scores && (
                        <div className="flex items-start gap-2 bg-yellow-50 rounded-xl p-3 shadow-sm">
                            <AlertTriangle className="text-amber-500 w-5 h-5 mt-1" />
                            <div>
                                <p className="font-medium text-slate-800">คะแนนใกล้หมดอายุ ⚠️</p>
                                <p>
                                    คุณมี{" "}
                                    <span className="font-semibold text-yellow-600">
                                        {scores.total_score_soon_expire.toLocaleString()}
                                    </span>{" "}
                                    คะแนน ที่จะหมดอายุใน {scores.expire_message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ปุ่ม */}
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="px-4 py-2 w-full sm:w-auto rounded-xl bg-white border border-yellow-300 text-slate-700 hover:bg-yellow-50 transition"
                    >
                        ปิด
                    </button>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            router.push("/user/rewards");
                        }}
                        className="px-4 py-2 w-full sm:w-auto rounded-xl bg-yellow-400 text-slate-900 font-medium hover:bg-yellow-500 transition"
                    >
                        ดูโปรโมชั่น
                    </button>
                </div>
            </div>
        </div>

    );
}
