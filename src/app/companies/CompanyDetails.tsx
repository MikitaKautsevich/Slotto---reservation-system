import { FC } from "react";
import { Company } from "@/types/company";
import Button from "@/components/custom/Button";

interface CompanyDetailsProps {
  company: Company;
  onReserveClick: () => void;
}

const CompanyDetails: FC<CompanyDetailsProps> = ({ company, onReserveClick }) => {
  return (
    <div className="p-6 min-h-[calc(100vh-100px)] bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
      <p className="text-gray-500 mb-4">{company.category}</p>

      {company.photoURL && (
        <img src={company.photoURL} alt={company.name} className="w-full h-64 object-cover rounded-lg mb-4" />
      )}

      {company.description && <p className="mb-4">{company.description}</p>}

      {company.menu && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-2">Menu</h2>
          <ul className="list-disc list-inside">
            {company.menu.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {company.services && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-2">Services</h2>
          <ul className="list-disc list-inside">
            {company.services.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onReserveClick}>Reserve Slot</Button>
    </div>
  );
};

export default CompanyDetails;
