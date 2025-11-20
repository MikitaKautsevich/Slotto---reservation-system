import { FC, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Company } from "@/types/company";
import { useRouter } from "next/navigation";
import CompaniesList from "./CompaniesList";

const CompaniesPage: FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      const querySnapshot = await getDocs(collection(db, "companies"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Company[];
      setCompanies(list);
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCompanyClick = (company: Company) => {
    router.push(`/companies/${company.id}`);
  };

  return (
    <CompaniesList
      companies={filteredCompanies}
      search={search}
      onSearchChange={setSearch}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default CompaniesPage;
