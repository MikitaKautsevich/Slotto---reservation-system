'use client';

import { FC } from "react";

const History: FC = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Reservation History</h2>
      <p>Here you can see all your past reservations.</p>
      {/* TODO: Подтянуть историю бронирований из Firebase */}
    </div>
  );
};

export default History;
