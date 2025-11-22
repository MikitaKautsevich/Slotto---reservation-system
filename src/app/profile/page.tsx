'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User, sendEmailVerification } from "firebase/auth";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail } from "firebase/auth";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import { useRouter } from "next/navigation";
import Popup from "@/components/custom/Popup";
import InfoPopup from "@/components/custom/InfoPopup";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [sentCode, setSentCode] = useState("");

  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);

  const router = useRouter();
  const authInstance = getAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ current: false, new: false, confirm: false });

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
          const data = docSnap.data();
          setUserData(data);
          setNewName(data.fullName);
          setNewPhone(data.phone);
          setNewEmail(currentUser.email);
        }
      } else setUserData(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Update user data ---
  const handleUpdateData = async () => {
    if (!user) return;
    try {
      if (newEmail !== user.email) {
        // отправляем код на новый email
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(code);
        alert(`Verification code sent to ${newEmail}: ${code}`); // тут заменить на реальную отправку письма
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        fullName: newName,
        phone: newPhone,
      });

      setUserData((prev: any) => ({ ...prev, fullName: newName, phone: newPhone }));
      setInfoPopup({ title: "Profile Updated", message: "Your information has been updated." });
    } catch (error) {
      console.error(error);
      setInfoPopup({ title: "Error", message: error instanceof Error ? error.message : "Unknown error." });
    }
  };

  const verifyEmailCode = async () => {
    if (emailCode !== sentCode) {
      setInfoPopup({ title: "Invalid Code", message: "The verification code is incorrect." });
      return;
    }

    try {
      if (user) await updateEmail(user, newEmail);
      const userDocRef = doc(db, "users", user!.uid);
      await updateDoc(userDocRef, { email: newEmail });
      setUserData((prev: any) => ({ ...prev, email: newEmail }));
      setInfoPopup({ title: "Email Updated", message: "Your email has been successfully updated." });
      setSentCode("");
      setEmailCode("");
    } catch (error) {
      console.error(error);
      setInfoPopup({ title: "Error", message: error instanceof Error ? error.message : "Unknown error." });
    }
  };

  // --- Password change ---
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
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setInfoPopup({ title: "Password Changed", message: "Your password was successfully updated." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setInfoPopup({ title: "Error", message: error instanceof Error ? error.message : "Unknown error." });
    } finally { setLoading(false); }
  };

  // --- Subscription ---
  const cancelSubscription = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { cancelAtEnd: true });
      setUserData((prev: any) => ({ ...prev, cancelAtEnd: true }));
      setInfoPopup({
        title: "Subscription Scheduled",
        message: `Your subscription will remain active until ${userData.planEnd?.toDate().toLocaleDateString()}. After that, you'll revert to the Free plan.`,
      });
    } catch (error) {
      console.error(error);
      setInfoPopup({ title: "Failed", message: "Something went wrong." });
    }
  };

  const upgradeSubscription = () => {
    router.push("/priceList");
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-white">Please log in first.</p>;
  if (!userData) return <p className="text-center mt-10 text-white">No user data found.</p>;

  const createdAt = userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : null;
  const planStart = userData.planStart instanceof Timestamp ? userData.planStart.toDate() : null;
  const planEnd = userData.planEnd instanceof Timestamp ? userData.planEnd.toDate() : null;

  return (
    <div className="relative min-h-screen px-6 py-16 bg-black/5 overflow-hidden">

      {/* Neon background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px] animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">

        {/* User Info */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-4xl text-white shadow-lg">
              {userData.avatarUrl ? <img src={userData.avatarUrl} alt="Avatar" className="rounded-full w-24 h-24" /> : "👤"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{userData.fullName ?? "—"}</h1>
              <p className="text-white/60">{userData.role ?? "User"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
            <div className="flex flex-col">
              <span className="text-white/60 text-sm">Full Name</span>
              <Input value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/10 text-white placeholder-white/50 border-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm">Phone</span>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-white/10 text-white placeholder-white/50 border-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-white/60 text-sm">Email</span>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-white/10 text-white placeholder-white/50 border-white/20" />
            </div>
            {sentCode && (
              <div className="flex flex-col">
                <span className="text-white/60 text-sm">Verification Code</span>
                <Input value={emailCode} onChange={e => setEmailCode(e.target.value)} className="bg-white/10 text-white placeholder-white/50 border-white/20" />
                <Button onClick={verifyEmailCode} className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">Verify Email</Button>
              </div>
            )}
          </div>
          <Button onClick={handleUpdateData} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">Save Changes</Button>
        </section>

        {/* Subscription */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold text-white mb-4">Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
            <InfoRow label="Current Plan" value={userData.currentPlan || "Not selected"} />
            <InfoRow label="Start Date" value={planStart ? planStart.toLocaleDateString() : "-"} />
            <InfoRow label="Valid Until" value={planEnd ? planEnd.toLocaleDateString() : "-"} />
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-[1.02] transition" onClick={upgradeSubscription}>
              Upgrade / Change
            </Button>
            <Button disabled={userData.cancelAtEnd} onClick={cancelSubscription} className="px-4 py-2 bg-red-600 rounded-xl hover:scale-[1.02] transition">
              {userData.cancelAtEnd ? "Cancellation Scheduled" : "Cancel Subscription"}
            </Button>
          </div>
          {userData.cancelAtEnd && <p className="text-white/60 mt-2 text-sm">Your subscription will remain active until {planEnd?.toLocaleDateString()}</p>}
        </section>

        {/* Password Change */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold text-white mb-2">Change Password</h2>
          <p className="text-white/60 text-sm mb-4">Update your password regularly to keep your account secure.</p>

          {[{ value: currentPassword, set: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, placeholder: "Current Password", field: "current" },
            { value: newPassword, set: setNewPassword, show: showNew, setShow: setShowNew, placeholder: "New Password", field: "new" },
            { value: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, placeholder: "Confirm New Password", field: "confirm" }]
            .map((item, idx) => (
              <div key={idx} className="relative mt-3">
                <Input
                  type={item.show ? "text" : "password"}
                  placeholder={item.placeholder}
                  value={item.value}
                  onChange={(e) => item.set(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, [item.field]: true }))}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-purple-500"
                />
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/60" onClick={() => item.setShow(!item.show)}>
                  {item.show ? <FaEyeSlash /> : <FaEye />}
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validations[item.field] ? <FaCheckCircle className="text-green-400" /> : touched[item.field] && <FaTimesCircle className="text-red-400" />}
                </div>
                {showError(item.field) && <p className="text-red-400 text-sm mt-1">{item.field === "new" ? "Password must be at least 8 chars" : item.field === "confirm" ? "Passwords do not match" : "Please enter your current password."}</p>}
              </div>
            ))}
          <Button onClick={handleChangePassword} disabled={loading || !validations.current || !validations.new || !validations.confirm} className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition">
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </section>

      </div>

      {popupData && <Popup title={popupData.title} message={popupData.message} onClose={() => setPopupData(null)} onConfirm={() => { popupData.onConfirm(); setPopupData(null); }} />}
      {infoPopup && <InfoPopup title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup(null)} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
