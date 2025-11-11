"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/custom/Button";
import Popup from "@/components/custom/Popup";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import InfoPopup from "@/components/custom/InfoPopup";
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

        // Добавляем задержку для скелетона (2–3 сек)
        setTimeout(() => {
          setPricePlans(plans);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching price plans:", error);
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
      console.error("Error updating user plan:", error);
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
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-4">Pricing Plans</h1>
      <p className="text-center text-gray-600 mb-12">
        Choose the best plan for your business. Upgrade anytime.
      </p>

      {/* Скелетон */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 rounded-xl shadow-md p-6 flex flex-col justify-between"
            >
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-6" />
              <div className="space-y-2 mb-6">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-300 rounded" />
                ))}
              </div>
              <div className="h-10 bg-gray-300 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Плановые карточки */}
          <div className="grid md:grid-cols-3 gap-6 transition-all duration-500">
            {pricePlans.map((plan, index) => {
              const isCurrent = currentPlan === plan.name;
              const isRecommended = plan.name.toLowerCase().includes("pro") || index === 1;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl shadow-lg p-8 flex flex-col justify-between transition transform hover:scale-105 border
                  ${isRecommended ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                >
                  {isRecommended && (
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-4xl font-extrabold mb-6">{plan.price} €</p>

                  <ul className="space-y-2 mb-6">
                    {plan.information.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <span className="mr-2 text-green-500 font-bold">✔</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      isCurrent
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={isCurrent}
                    onClick={() => !isCurrent && selectPlan(plan)}
                  >
                    {isCurrent ? "Your Current Plan" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Попапы */}
          {selectedPlan && (
            <Popup
              title="Confirm Subscription"
              message={`Are you sure you want to subscribe to "${selectedPlan.name}"?`}
              onConfirm={confirmPlan}
              onClose={() => setSelectedPlan(null)}
            />
          )}

          {infoPopup && (
            <InfoPopup
              title={infoPopup.title}
              message={infoPopup.message}
              onClose={() => setInfoPopup(null)}
            />
          )}

          {/* Таблица сравнения */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="border p-3">Feature</th>
                    {pricePlans.map((plan) => (
                      <th
                        key={plan.name}
                        className={`border p-3 text-center font-semibold ${
                          plan.name === "Pro" ? "bg-blue-50" : "bg-gray-50"
                        }`}
                      >
                        {plan.name}
                      </th>
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
                    <tr key={idx} className="border-t">
                      <td className="border p-3 font-medium">{feature}</td>
                      {pricePlans.map((plan, i) => (
                        <td key={i} className="border p-3 text-center">
                          {i === 0 && idx < 2 ? "✔" : i === 1 && idx < 4 ? "✔" : i === 2 ? "✔" : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
