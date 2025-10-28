'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Reservations from "../reservations/page";
import Companies from "../companies/page";
import CreateReservation from "../createReservation/page";
import History from "../history/page";

enum Tab {
  Reservations = "Reservations",
  Companies = "Companies",
  CreateReservation = "Create Reservation",
  History = "History",
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null >(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Reservations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Reservations: return <Reservations />;
      case Tab.Companies: return <Companies />;
      case Tab.CreateReservation: return <CreateReservation />;
      case Tab.History: return <History />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] bg-gray-100">
      <nav className="w-64 p-6 bg-white rounded-xl shadow-md space-y-4 flex flex-col my-6 ml-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {Object.values(Tab).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Контент */}
      <main className="flex-1 p-6">
        {renderTabContent()}
      </main>
    </div>
  );
}










// 'use client';

// import { useEffect, useState } from "react";
// import { auth, db } from "@/lib/firebase";
// import { doc, getDoc } from "firebase/firestore";
// import { onAuthStateChanged, User } from "firebase/auth";
// import Reservations from "../reservations/page";
// import Companies from "../companies/page";
// import CreateReservation from "../createReservation/page";
// import History from "../history/page";
// import { FaBars, FaTimes } from "react-icons/fa";

// enum Tab {
//   Reservations = "Reservations",
//   Companies = "Companies",
//   CreateReservation = "Create Reservation",
//   History = "History",
// }

// export default function Dashboard() {
//   const [user, setUser] = useState<User | null>(null);
//   const [userData, setUserData] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<Tab>(Tab.Reservations);
//   const [loading, setLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         const docRef = doc(db, "users", currentUser.uid);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setUserData(docSnap.data());
//         }
//       } else {
//         setUserData(null);
//       }
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (loading) return <p className="text-center mt-10">Loading...</p>;
//   if (!user) return <p className="text-center mt-10">Please log in first.</p>;

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case Tab.Reservations: return <Reservations />;
//       case Tab.Companies: return <Companies />;
//       case Tab.CreateReservation: return <CreateReservation />;
//       case Tab.History: return <History />;
//     }
//   };

//   const tabs = Object.values(Tab);

//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       {/* Мобильная кнопка для открытия меню */}
//       <div className="md:hidden fixed top-4 left-4 z-50">
//         <button
//           onClick={() => setIsSidebarOpen(true)}
//           className="p-2 rounded-md bg-blue-600 text-white"
//         >
//           <FaBars size={20} />
//         </button>
//       </div>

//       {/* Sidebar */}
//       <nav
//         className={`
//           fixed md:relative top-0 left-0 z-40 h-full w-64 bg-white p-6 space-y-4 shadow-md
//           transform transition-transform duration-300
//           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
//         `}
//       >
//         <div className="flex justify-between md:block mb-6">
//           <h1 className="text-2xl font-bold">Dashboard</h1>
//           {/* Кнопка закрытия на мобилке */}
//           <button
//             className="md:hidden mt-2 p-2 text-gray-600"
//             onClick={() => setIsSidebarOpen(false)}
//           >
//             <FaTimes size={20} />
//           </button>
//         </div>

//         {tabs.map(tab => (
//           <button
//             key={tab}
//             onClick={() => {
//               setActiveTab(tab);
//               setIsSidebarOpen(false); // закрываем sidebar на мобилке
//             }}
//             className={`text-left px-4 py-2 rounded-lg font-medium transition w-full ${
//               activeTab === tab
//                 ? "bg-blue-600 text-white"
//                 : "text-gray-700 hover:bg-gray-200"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </nav>

//       {/* Overlay для мобильного меню */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 z-30 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Контент */}
//       <main className="flex-1 p-6 md:ml-64">{renderTabContent()}</main>
//     </div>
//   );
// }
