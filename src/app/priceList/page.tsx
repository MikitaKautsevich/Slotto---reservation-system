"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Popup from "@/components/Popup";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import InfoPopup from "@/components/InfoPopup";

interface Plan {
  id?: string;
  name: string;
  price: number | string;
  information: string[];
}

export default function PriceList() {
  const [pricePlans, setPricePlans] = useState<Plan[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const [infoPopup, setInfoPopup] = useState<{ title: string; message: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
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
          } as Plan;
        });
        setPricePlans(plans);
      } catch (error) {
        console.error("Error fetching price plans:", error);
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

  const selectPlan = (plan: Plan) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Pricing Plans</h1>
      <p className="text-center text-gray-600 mb-12">
        Choose the best plan for your company and start managing reservations efficiently.
      </p>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricePlans.map((plan) => {
          const isCurrent = currentPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={`rounded-xl shadow-lg p-6 flex flex-col justify-between transition transform hover:scale-105
              ${isCurrent ? "border-2 border-blue-500" : "border"}`}
            >
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-3xl font-extrabold mb-6">{plan.price} €</p>
              <ul className="space-y-2 mb-6">
                {plan.information.map((feature, index) => (
                  <li key={index} className="flex items-center">
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

      {/* Popup подтверждения */}
      {selectedPlan && (
        <Popup
          title="Confirm Subscription"
          message={`Are you sure you want to subscribe to the "${selectedPlan.name}" plan?`}
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

      {/* Comparison table */}
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
                    className="border p-3 text-center bg-gray-100 font-semibold"
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
                  {pricePlans.map((plan) => (
                    <td key={plan.name} className="border p-3 text-center">
                      {2 > 1 ? "✔" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}