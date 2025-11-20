"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import { useRouter } from "next/navigation";
import Popup from "@/components/custom/Popup";
import InfoPopup from "@/components/custom/InfoPopup";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);

  const router = useRouter();
  const authInstance = getAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // --- Валидация ---
  const validations = {
    current: currentPassword.length > 0,
    new: newPassword.length >= 8,
    confirm: newPassword === confirmPassword && confirmPassword.length > 0,
  };

  const showError = (field: "current" | "new" | "confirm") => touched[field] && !validations[field];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Password change handler ---
  const handleChangePassword = async () => {
    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match!");
      return;
    }

    setPasswordMessage("");
    setLoading(true);

    try {
      if (!user.email) {
        setPasswordMessage("User email is missing.");
        setLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setInfoPopup({
        title: "Password Changed",
        message: "Your password was successfully updated.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setInfoPopup({
        title: "Error",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Subscription cancellation ---
  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        currentPlan: "Not selected",
        planStart: null,
        planEnd: null,
      });

      setUserData((prev: any) => ({
        ...prev,
        currentPlan: "Not selected",
        planStart: null,
        planEnd: null,
      }));

      setInfoPopup({
        title: "Subscription Cancelled",
        message: "You have successfully cancelled your subscription.",
      });
    } catch (error) {
      console.error(error);
      setInfoPopup({
        title: "Failed",
        message: "Something went wrong while cancelling your subscription.",
      });
    }
  };

  const handleCancelClick = () => {
    setPopupData({
      title: "Cancel Subscription?",
      message: "Are you sure you want to cancel your subscription?",
      onConfirm: cancelSubscription,
    });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;
  if (!userData) return <p className="text-center mt-10">No user data found.</p>;

  const createdAt = userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : null;
  const planStart = userData.planStart instanceof Timestamp ? userData.planStart.toDate() : null;
  const planEnd = userData.planEnd instanceof Timestamp ? userData.planEnd.toDate() : null;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">

      {/* --- User Info --- */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-600">
            {userData.avatarUrl ? <img src={userData.avatarUrl} alt="Avatar" className="rounded-full w-20 h-20" /> : "👤"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.fullName ?? "—"}</h1>
            <p className="text-gray-500">{userData.role ?? "User"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Email" value={user.email ?? "-"} />
          <InfoRow label="Phone" value={userData.phone ?? "—"} />
          <InfoRow label="Created At" value={createdAt ? createdAt.toLocaleDateString() : "—"} />
          <InfoRow label="Role" value={userData.role ?? "User"} />
        </div>
      </section>
      {/* --- Subscription --- */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Subscription</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoRow label="Current Plan" value={userData.currentPlan || "Not selected"} />
          <InfoRow label="Start Date" value={planStart ? planStart.toLocaleDateString() : "—"} />
          <InfoRow label="Valid Until" value={planEnd ? planEnd.toLocaleDateString() : "—"} />
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <Button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => router.push("/priceList")}
          >
            Change Subscription
          </Button>
          <Button
            disabled={userData.currentPlan === "Not selected" || !userData.currentPlan}
            onClick={handleCancelClick}
            className="bg-red-600 hover:bg-red-700"
          >
            Cancel Subscription
          </Button>
        </div>
      </section>

      {/* --- Popups --- */}
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupData(null)}
          onConfirm={() => {
            popupData.onConfirm();
            setPopupData(null);
          }}
        />
      )}

      {infoPopup && (
        <InfoPopup
          title={infoPopup.title}
          message={infoPopup.message}
          onClose={() => setInfoPopup(null)}
        />
      )}

      {/* --- Change Password --- */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-2">Change Password</h2>
      <p className="text-gray-500 text-sm mb-4">
        Update your password regularly to keep your account secure.
      </p>
      {/* Current Password */}
      <div className="relative">
        <Input
          type={showCurrent ? "text" : "password"}
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, current: true }))}
        />
        <div
          className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowCurrent(!showCurrent)}
        >
          {showCurrent ? <FaEyeSlash /> : <FaEye />}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validations.current ? <FaCheckCircle  /> : touched.current && <FaTimesCircle />}
        </div>
        {showError("current") && <p className="text-red-500 text-sm mt-1">Please enter your current password.</p>}
      </div>
      {/* New Password */}
      <div className="relative mt-2">
        <Input
          type={showNew ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, new: true }))}
        />
        <div
          className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowNew(!showNew)}
        >
          {showNew ? <FaEyeSlash /> : <FaEye />}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validations.new ? <FaCheckCircle  /> : touched.new && <FaTimesCircle />}
        </div>
        {showError("new") && <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters long.</p>}
      </div>

      {/* Confirm Password */}
      <div className="relative mt-2">
        <Input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
        />
        <div
          className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validations.confirm ? <FaCheckCircle /> : touched.confirm && <FaTimesCircle />}
        </div>
        {showError("confirm") && <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>}
      </div>

      <Button
        onClick={handleChangePassword}
        disabled={loading || !validations.current || !validations.new || !validations.confirm}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Changing..." : "Change Password"}
      </Button>
    </section>
    </div>
  );
}

// --- Helper Component ---
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
