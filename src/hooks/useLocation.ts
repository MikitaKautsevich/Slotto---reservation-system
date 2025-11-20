"use client";

import { useEffect, useState } from "react";

export const useLocation = () => {
  const [city, setCity] = useState<string | null>(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Читаем кеш
    const cached = localStorage.getItem("slotto_city");
    if (cached) {
      setCity(cached);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            {
              headers: {
                "User-Agent": "SlottoApp/1.0 (contact@slotto.app)",
                "Accept-Language": "en",
              },
            }
          );

          const data = await res.json();

          const detected =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown";

          setCity(detected);
          localStorage.setItem("slotto_city", detected);
        } catch (e) {
          console.error(e);
          setCity("Unknown");
        }
      },
      () => {
        setGeoError(true);
      }
    );
  }, []);

  return { city, geoError };
};
