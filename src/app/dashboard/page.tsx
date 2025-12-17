'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Top5Places from "@/components/dashboard/Top5Places";
import CompanyTypesSlider from "@/components/dashboard/CompanyTypesSlider";
import CompaniesGrid from "@/components/dashboard/CompaniesGrid";
import { Loading } from "../Loading";
import { Company } from "@/types/company";
import AmbientCanvas from "@/components/dashboard/AmbientCanvas";
import KPIStats from "@/components/dashboard/KPIStats";
import SpotlightSearch from "@/components/dashboard/SpotlightSearch";


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUser(docSnap.data() as User);
      } else {
        setUser(null);
      }

      const companiesSnap = await getDocs(collection(db, "companies"));
      setCompanies(
        companiesSnap.docs.map((doc) => {
          const data = doc.data() as Company;
          if (!data.id) data.id = doc.id;
          return data;
        })
      );

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const top5Places = companies
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const filteredCompanies = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );


  if (loading) return <Loading/>;
  if (!user) return <p className="text-center mt-10">Please log in first.</p>;

    return (
  <div className="min-h-screen p-8 space-y-20 relative">

    <Top5Places places={top5Places} />

    {/* <SpotlightSearch value={search} onChange={setSearch} /> */}

    <CompaniesGrid companies={filteredCompanies} />

    <CompanyTypesSlider />

  </div>
);
}
