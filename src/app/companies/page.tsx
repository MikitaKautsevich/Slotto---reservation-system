'use client';

import { FC, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Button from "@/components/ui/Button";
import Popup from "@/components/Popup";

interface Company {
  id: string;
  name: string;
  category: string;
  web: string;
  description?: string;
  photoUrl?: string;
}

const Companies: FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [popupData, setPopupData] = useState<{ title: string; message: string } | null>(null);

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
    setPopupData({
      title: "Reservation Confirmed",
      message: `You have reserved a slot with ${company.name}.`
    });
  };

  const categories = Array.from(new Set(companies.map(c => c.category).filter(Boolean)));

  const formatWebLink = (web: string) => {
    if (!web) return "#";
    return web.startsWith("http") ? web : `https://${web}`;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4 min-h-[calc(100vh-100px)]">
      <h2 className="text-2xl font-bold">Companies</h2>

      {/* Поиск и фильтр */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm w-full md:w-1/2"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm w-full md:w-1/3"
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
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
              onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
            >
              {company.photoUrl && (
                <img
                  src={company.photoUrl}
                  alt={company.name}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-xl font-semibold">{company.name}</h3>
                <p className="text-gray-500 text-sm">{company.category}</p>

                {/* Плавное раскрытие описания */}
                <div
                  className={`overflow-hidden transition-[max-height] duration-500 ${
                    isExpanded ? "max-h-40" : "max-h-0"
                  }`}
                >
                  {company.description && (
                    <p className="text-gray-700 text-sm mt-2">{company.description}</p>
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
                  <Button className="mt-4 w-full" onClick={() => reserveSlot(company)}>
                    Reserve Slot
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
};

export default Companies;
