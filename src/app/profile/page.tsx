"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { FaRegUserCircle } from "react-icons/fa";
import { getAuth, sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import Popup from "@/components/Popup";


export default function ProfilePage() {

  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [popupData, setPopupData] = useState<{ title: string; message: string } | null>(null);


  const router = useRouter();

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

  const auth = getAuth();

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (!user.email) {
        setMessage("User email is missing.");
        setLoading(false);
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        currentPlan: "Not selected",
        planStart: null,
        planEnd: null,
      });

    setUserData((prev: User | null) => ({
      ...prev,
      currentPlan: "Not selected",
      planStart: null,
      planEnd: null,
    }));

    setPopupData({
      title: "Subscription cancelled successfully.",
      message: "You have successfully cancelled your subscription. We hope to see you again soon!"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setPopupData({
        title: "Failed to cancel subscription. Please try again.",
        message: "Something went wrong while cancelling your subscription. Please try again."
      });
    }
}

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;
  if (!userData) return <p className="text-center mt-10">No user data found.</p>;

  const createdAt =
    userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : null;
  const planStart =
    userData.planStart instanceof Timestamp ? userData.planStart.toDate() : null;
  const planEnd =
    userData.planEnd instanceof Timestamp ? userData.planEnd.toDate() : null;

  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100">
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.fullName ?? "—"}</h1>
            <p className="text-gray-500">{userData.role ?? "User"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Email" value={user.email ?? "-"} />
          <InfoRow label="Phone" value={userData.phone ?? "—"} />
          <InfoRow
            label="Created At"
            value={createdAt ? createdAt.toLocaleDateString() : "—"}
          />
          <InfoRow label="Role" value={userData.role ?? "User"} />
        </div>
        </section>
        <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            {/* {isGoogleUser && ( */}
            <div className="mt-4 max-w-sm">
                <Input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2"
                />
                <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2"
                />

                {message && <p className="mt-2 text-red-500">{message}</p>}

                <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="mt-4"
                >
                    {loading ? "Changing..." : "Change Password"}
                </Button>
            </div>
        </section>
        <section className="bg-white shadow-md rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoRow label="Current Plan" value={userData.currentPlan !== "" ? userData.currentPlan : "Not selected"} />
            <InfoRow
                label="Start Date"
                value={planStart ? planStart.toLocaleDateString() : "—"}
            />
            <InfoRow
                label="Valid Until"
                value={planEnd ? planEnd.toLocaleDateString() : "—"}
            />
            </div>

            <div className="flex flex-wrap gap-4">
            <Button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick= {() => router.push('/priceList')}
            >
                Change Subscription
            </Button>
            <Button
                disabled={userData.currentPlan === "Not selected" || !userData.currentPlan}
                onClick={cancelSubscription}
                className="bg-red-600 hover:bg-red-700"
            >
                Cancel Subscription
            </Button>

            </div>
      </section>
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
