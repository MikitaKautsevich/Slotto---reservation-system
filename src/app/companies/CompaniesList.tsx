import { FC } from "react";
import { Company } from "@/types/company";
import { FaBuilding } from "react-icons/fa";
import Button from "@/components/custom/Button";

interface CompaniesListProps {
  companies: Company[];
  search: string;
  onSearchChange: (value: string) => void;
  onCompanyClick: (company: Company) => void;
}

const CompaniesList: FC<CompaniesListProps> = ({
  companies,
  search,
  onSearchChange,
  onCompanyClick
}) => {
  return (
    <div className="p-6 min-h-[calc(100vh-100px)] bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Companies</h2>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="px-4 py-2 rounded-lg border shadow-sm w-full md:w-1/2 focus:ring-2 focus:ring-blue-300 mb-6"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div
            key={company.id}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            onClick={() => onCompanyClick(company)}
          >
            <div className="relative h-40 w-full flex items-center justify-center bg-gray-100">
              {company.photoURL ? (
                <img
                  src={company.photoURL}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaBuilding className="text-6xl text-gray-400" />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
              <p className="text-gray-500 text-sm">{company.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesList;
