'use client';

import { FC, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Popup from "@/components/Popup";

const CreateReservation: FC = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [popupData, setPopupData] = useState<{ title: string; message: string } | null>(null);

  const handleCreate = () => {
    setPopupData({
      title: "Reservation Created",
      message: `Reservation for ${name} on ${date} has been successfully created!`
    });
    setName("");
    setDate("");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Create Reservation</h2>
      <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Button className="w-full mt-2" onClick={handleCreate}>Create Reservation</Button>

      {popupData && <Popup title={popupData.title} message={popupData.message} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default CreateReservation;
