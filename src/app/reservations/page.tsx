'use client';

import { FC } from "react";

const Reservations: FC = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Current Reservations</h2>
      <p>You can see all your active reservations here.</p>
      {/* TODO: Добавить список бронирований из Firebase */}
    </div>
  );
};

export default Reservations;
