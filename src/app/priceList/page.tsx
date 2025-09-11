'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Popup from "@/components/Popup";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

  const [popupData, setPopupData] = useState<{ title: string; message: string } | null>(null);

  
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
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

const selectPlan = async (planName: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await updateDoc(userDocRef, {
        currentPlan: planName,
        planStart: Timestamp.fromDate(startDate),
        planEnd: Timestamp.fromDate(endDate),
      });

      setPopupData({
      title: "Subscription Successful!",
      message: `You have successfully subscribed to the ${planName} plan.`,
      });
    } catch (error) {
        console.error("Error updating user plan:", error);
        setPopupData({
          title: "Subscription Failed",
          message: "Something went wrong. Please try again.",
        });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Pricing Plans</h1>
      <p className="text-center text-gray-600 mb-12">
        Choose the best plan for your company and start managing reservations efficiently.
      </p>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricePlans &&
          pricePlans.map((plan: Plan) => (
            <div
              key={plan.name}
              className={`border rounded-xl shadow-lg p-6 flex flex-col justify-between transition transform hover:scale-105`}
            >
              {/* {plan.bestValue && (
          <div className="text-sm text-white bg-blue-600 px-2 py-1 rounded-full mb-3 w-max">
            Best Value
          </div> */}
              {/* )} */}
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-3xl font-extrabold mb-6">{plan.price} €</p>
              <ul className="space-y-2 mb-6">
          {plan.information.map((feature: string, index: number) => (
            <li key={index} className="flex items-center">
              <span className="mr-2 text-green-500 font-bold">✔</span>
              {feature}
            </li>
          ))}
              </ul>
              <Button
                className= "w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => selectPlan(plan.name)}
              >
                Select
              </Button>
            </div>
          ))}
      </div>
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupData(null)}
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
                {pricePlans && pricePlans.map((plan: Plan) => (
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
                  {pricePlans && pricePlans.map((plan: Plan) => {
                  return (
                    <td key={plan.name} className="border p-3 text-center">
                    {2 > 1 ? "✔" : "—"}
                    </td>
                  );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
