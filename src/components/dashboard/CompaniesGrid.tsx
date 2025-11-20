"use client";

import { useState, useMemo, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";
import { Company } from "@/types/company";
import Select from "../custom/Select";
import Card from "../custom/Card";
import { InfoMessage } from "../custom/InfoMessage";
import Search from "../custom/Search";

/**
 * CompaniesGrid — cinematic infinite scroll + Vision Pro floating glass cards
 */
export default function CompaniesGrid({ companies }: { companies: Company[] }) {
  // Filters / search
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Infinite scroll / pagination state
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Derived filter lists
  const locations = useMemo(
    () => Array.from(new Set(companies.map((c) => c.location))).filter(Boolean),
    [companies]
  );
  const categories = useMemo(
    () => Array.from(new Set(companies.map((c) => c.category))).filter(Boolean),
    [companies]
  );
  const ratings = [5, 4, 3, 2, 1];

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRating = selectedRating
        ? Math.floor(company.rating || 0) === selectedRating
        : true;
      const matchesLocation = selectedLocation
        ? company.location === selectedLocation
        : true;
      const matchesCategory = selectedCategory
        ? company.category === selectedCategory
        : true;
      return (
        matchesSearch &&
        matchesRating &&
        matchesLocation &&
        matchesCategory
      );
    });
  }, [companies, search, selectedRating, selectedLocation, selectedCategory]);

  // Reset visibleCount when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedRating, selectedLocation, selectedCategory]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore) {
            if (visibleCount < filteredCompanies.length) {
              setIsLoadingMore(true);
              // simulate short loading for cinematic effect; you can remove timeout if you want instant
              setTimeout(() => {
                setVisibleCount((v) =>
                  Math.min(filteredCompanies.length, v + PAGE_SIZE)
                );
                setIsLoadingMore(false);
              }, 600);
            }
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loadMoreRef, visibleCount, filteredCompanies.length, isLoadingMore]);

  // small helper to get image fallback
  const getImage = (c: Company) =>
    c.image ||
    c.cover ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=60&auto=format&fit=crop";

  // Motion variants for cinematic staggered entrance
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.35 } },
  };

  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -left-24 -top-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 via-indigo-300/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-gradient-to-br from-pink-400/30 via-amber-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900">Discover Companies</h2>
        <p className="text-gray-500 mt-3">
          Browse curated companies — cinematic visuals, floating glass cards, and smooth infinite scrolling.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Search value={search} onChange={setSearch} placeholder="Search companies..." />

        <Select
          value={selectedRating ? `${selectedRating} ⭐` : ""}
          onChange={(e) =>
            setSelectedRating(e.target.value ? Number(e.target.value[0]) : null)
          }
          options={["All Ratings", ...ratings.map((r) => `${r} ⭐`)]}
        />

        <Select
          value={selectedLocation || "All Locations"}
          onChange={(e) =>
            setSelectedLocation(
              e.target.value === "All Locations" ? "" : e.target.value
            )
          }
          options={["All Locations", ...locations]}
        />

        <Select
          value={selectedCategory || "All Categories"}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value === "All Categories" ? "" : e.target.value
            )
          }
          options={["All Categories", ...categories]}
        />
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence>
          {filteredCompanies.length === 0 ? (
            <InfoMessage
              message="No companies found."
              className="col-span-full text-center mt-8"
            />
          ) : (
            filteredCompanies.slice(0, visibleCount).map((company, idx) => {
              const path = `/${(company.name || "company").replace(/\s+/g, "")}_${company.id}`;
              return (
                <motion.div
                  key={company.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="relative"
                >
                  {/* Vision Pro floating glass card */}
                  <Tilt
                    perspective={1500}
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    glareEnable={true}
                    glareMaxOpacity={0.18}
                    glareColor="white"
                    scale={1.03}
                    transitionSpeed={600}
                    className="relative rounded-2xl overflow-hidden"
                  >
                    {/* Floating wrapper gives gentle bobbing effect */}
                    <motion.div
                      whileHover={{ translateY: -6 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 6 + (idx % 3), repeat: Infinity, ease: "easeInOut" }}
                      className="backdrop-blur-xl bg-white/6 border border-white/8 rounded-2xl shadow-[0_8px_40px_rgba(2,6,23,0.25)] overflow-hidden"
                      style={{ WebkitBackdropFilter: "blur(10px)", transformStyle: "preserve-3d" }}
                    >
                      {/* image area */}
                      <div
                        className="h-40 bg-gray-200/40 bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.36), rgba(2,6,23,0.05)), url(${getImage(company)})`,
                        }}
                      />

                      {/* content */}
                      <div className="p-5">
                        <Link href={path} className="block">
                          <h3 className="text-lg font-semibold text-white/95 line-clamp-2">
                            {company.name}
                          </h3>

                          <p className="mt-2 text-sm text-white/70">{company.category}</p>
                          <p className="mt-1 text-xs text-white/50">{company.location}</p>

                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-yellow-400 text-black font-medium text-sm shadow-sm">
                                ⭐ {company.rating || "0.0"}
                              </span>
                              <span className="text-xs text-white/60 ml-2">({company.reviews || 0})</span>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.96 }}
                              className="px-3 py-1 text-sm font-semibold rounded-lg bg-white/90 text-black shadow"
                            >
                              View →
                            </motion.button>
                          </div>
                        </Link>
                      </div>

                      {/* subtle floating rim glow */}
                      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                           style={{
                             boxShadow: "0 20px 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.02)"
                           }}
                      />
                    </motion.div>
                  </Tilt>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Load more sentinel + loader */}
      <div ref={loadMoreRef} className="mt-12 flex items-center justify-center">
        {isLoadingMore ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-white/70 animate-spin" />
            <span className="text-sm text-gray-500">Loading more…</span>
          </div>
        ) : visibleCount < filteredCompanies.length ? (
          <button
            onClick={() => setVisibleCount((v) => Math.min(filteredCompanies.length, v + PAGE_SIZE))}
            className="px-4 py-2 bg-white/10 text-white rounded-md"
          >
            Load more
          </button>
        ) : (
          <span className="text-sm text-gray-400">You’ve reached the end</span>
        )}
      </div>
    </section>
  );
}
