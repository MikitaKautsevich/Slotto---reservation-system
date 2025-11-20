import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
  params: { id: string };
}

export default async function CompanyPage({ params }: Props) {
  const { id } = params;

  const ref = doc(db, "companies", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return <div>Company not found</div>;
  }

  const company = snapshot.data();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{company.name}</h1>
      <p>{company.description}</p>
    </div>
  );
}
