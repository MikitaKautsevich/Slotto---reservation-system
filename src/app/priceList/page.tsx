'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/custom/Button";
import Popup from "@/components/custom/Popup";
import InfoPopup from "@/components/custom/InfoPopup";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { PricingPlan } from "@/types/pricingPlan";

export default function PriceList() {
  const [pricePlans, setPricePlans] = useState<PricingPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricePlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pricingPlans"));
        const plans = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            information: data.information,
          } as PricingPlan;
        });
        setTimeout(() => { 
          setPricePlans(plans);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchPricePlans();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setCurrentPlan(userSnap.data().currentPlan ?? null);
        }
      }
    });
    return unsubscribe;
  }, []);

  const confirmPlan = async () => {
    if (!selectedPlan || !user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await updateDoc(userDocRef, {
        currentPlan: selectedPlan.name,
        planStart: Timestamp.fromDate(startDate),
        planEnd: Timestamp.fromDate(endDate),
      });

      setCurrentPlan(selectedPlan.name);
      setInfoPopup({
        title: "Subscription Successful",
        message: `You have successfully subscribed to the ${selectedPlan.name} plan.`,
      });
    } catch (error) {
      console.error(error);
      setInfoPopup({
        title: "Subscription Failed",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSelectedPlan(null);
    }
  };

  const selectPlan = (plan: PricingPlan) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="relative min-h-screen px-6 py-16 text-white overflow-x-hidden">
      {/* Космический фон */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[150px] absolute -top-40 -left-20 animate-pulse-slow"></div>
        <div className="w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[200px] absolute top-1/3 right-0 animate-pulse-slow delay-500"></div>
        <div className="stars absolute inset-0"></div>
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-4 tracking-wide drop-shadow-lg">Cosmic Pricing Plans</h1>
      <p className="text-center text-white/70 mb-12 text-lg drop-shadow-sm">
        Choose your plan and elevate your experience to another galaxy.
      </p>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-8 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-white/10 rounded-3xl shadow-lg p-6 flex flex-col justify-between" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-8 perspective">
            {pricePlans.map((plan, idx) => {
              const isCurrent = currentPlan === plan.name;
              const isRecommended = plan.name.toLowerCase().includes("pro") || idx === 1;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl shadow-2xl p-8 flex flex-col justify-between transition-transform transform hover:scale-95 hover:rotate-y-2
                    bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 cursor-pointer hover:shadow-neon`}
                  onClick={() => !isCurrent && selectPlan(plan)}
                >
                  {isRecommended && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-400 text-black font-bold animate-pulse-neon">
                      Recommended
                    </span>
                  )}
                  <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{plan.name}</h2>
                  <p className="text-5xl font-extrabold mb-6 drop-shadow-lg">{plan.price} €</p>
                  <ul className="space-y-2 mb-6">
                    {plan.information.map((feature, i) => (
                      <li key={i} className="flex items-center text-white/90 hover:text-white transition">
                        <span className="mr-2 text-green-400 font-bold">✔</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      isCurrent 
                        ? "bg-green-500 hover:bg-green-600 text-black shadow-neon-button" 
                        : "hover:scale-105 hover:shadow-neon-button transition-transform"
                    }`}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Your Current Plan" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Таблица сравнения */}
          <div className="mt-16 overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6 text-center drop-shadow-md">Compare Plans</h2>
            <table className="w-full border-collapse text-left text-white/90 table-auto">
              <thead>
                <tr>
                  <th className="border p-3">Feature</th>
                  {pricePlans.map((plan) => (
                    <th key={plan.name} className="border p-3 text-center font-semibold bg-gray-800/50">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Reservations limit",
                  "Support",
                  "Reports",
                  "Notifications",
                  "Dedicated manager",
                  "API integrations",
                ].map((feature, idx) => (
                  <tr key={idx} className="border-t hover:bg-white/10 transition">
                    <td className="border p-3 font-medium">{feature}</td>
                    {pricePlans.map((plan, i) => (
                      <td key={i} className="border p-3 text-center">{i === 0 && idx < 2 ? "✔" : i === 1 && idx < 4 ? "✔" : i === 2 ? "✔" : "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedPlan && (
        <Popup
          title="Confirm Subscription"
          message={`Are you sure you want to subscribe to "${selectedPlan.name}"?`}
          onConfirm={confirmPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
      {infoPopup && <InfoPopup title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup(null)} />}

      <style jsx>{`
        .perspective { perspective: 1500px; }
        .hover\\:shadow-neon:hover { box-shadow: 0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(255,0,255,0.3); }
        .animate-pulse-neon { animation: pulseNeon 2s infinite; }
        .shadow-neon-button { box-shadow: 0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #f0f; }
        @keyframes pulseNeon { 0%,100% {box-shadow: 0 0 8px #fff,0 0 20px #ff0;} 50% {box-shadow: 0 0 20px #fff,0 0 30px #ff0;} }
        .animate-pulse-slow { animation: pulse 6s ease-in-out infinite alternate; }
        .stars {
          background: transparent url('https://raw.githubusercontent.com/jakesgordon/javascript-starfield/master/starfield.png') repeat;
          animation: moveStars 120s linear infinite;
        }
        @keyframes moveStars {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }
      `}</style>
    </div>
  );
}
