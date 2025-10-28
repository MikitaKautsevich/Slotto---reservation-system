'use client';

import { FC, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { FaBuilding, FaChevronDown } from "react-icons/fa";
import { Company } from "@/types/company";

const Companies: FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "companies"));
        const list: Company[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Company[];
        setCompanies(list);
        setFilteredCompanies(list);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    let list = companies;
    if (search) {
      list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter) {
      list = list.filter(c => c.category === categoryFilter);
    }
    setFilteredCompanies(list);
  }, [search, categoryFilter, companies]);

  const reserveSlot = (company: Company) => {
    router.push("/create-reservation");
  };

  const categories = Array.from(new Set(companies.map(c => c.category).filter(Boolean)));

  const formatWebLink = (web: string) => web.startsWith("http") ? web : `https://${web}`;

  return (
    <div className="p-6 min-h-[calc(100vh-100px)] bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Companies</h2>

      {/* Поиск и фильтр */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm w-full md:w-1/2 focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm w-full md:w-1/3 focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Список компаний */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => {
          const isExpanded = expandedCompany === company.id;

          return (
            <div
              key={company.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300
                ${isExpanded ? "shadow-xl border-2 border-blue-300" : "hover:shadow-lg"}
              `}
            >
              <div
                className="relative h-40 w-full flex items-center justify-center bg-gray-100"
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
              >
                {company.photoURL ? (
                  <img
                    src={company.photoURL}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaBuilding className="text-6xl text-gray-400" />
                )}
                <FaChevronDown
                  className={`absolute right-4 bottom-4 text-gray-600 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
                <p className="text-gray-500 text-sm">{company.category}</p>

                {/* Раскрытие */}
                <div
                  className={`overflow-hidden transition-[max-height,opacity,padding] duration-500 ${
                    isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  {company.description && (
                    <p className="text-gray-700 text-sm">{company.description}</p>
                  )}
                  {company.web && (
                    <a
                      href={formatWebLink(company.web)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      {company.web}
                    </a>
                  )}
                  <Button
                    className={`mt-4 w-full transition-opacity duration-300 ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                    // onClick={() => reserveSlot(company)}
                  >
                    Reserve Slot
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Companies;
