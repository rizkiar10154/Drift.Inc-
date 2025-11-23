"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GALLERY_CATEGORIES } from "@/constants/categories";

type GalleryItem = {
  id: string;
  url: string;
  category: string;
  caption: string;
  uploaded_at: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const CATEGORY_OPTIONS = ["All", ...GALLERY_CATEGORIES];

  // Fetch gallery from API
  const fetchGallery = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "24");

    if (categoryFilter !== "All") {
      params.append("category", categoryFilter);
    }

    try {
      const res = await fetch(`/api/gallery?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success) {
        const newData: GalleryItem[] = json.data;

        if (newData.length === 0) {
          setHasMore(false);
        } else {
          setImages((prev) => [...prev, ...newData]);
        }
      }
    } catch (err) {
      console.error("Error fetching gallery:", err);
    }

    setLoading(false);
  }, [categoryFilter, page]);

  // Reset when category filter changes
  useEffect(() => {
    setImages([]);
    setPage(1);
    setHasMore(true);
  }, [categoryFilter]);

  // Fetch when filter or page changes
  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, hasMore]);

  // Modal navigation
  const nextImage = () => {
    if (selectedImageIndex === null) return;
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex === null) return;
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  return (
    <section className="relative min-h-screen p-16 text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/track-bg.jpg')] bg-cover bg-center opacity-40"></div>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
          Drift.Inc Gallery
        </h1>

        {/* CATEGORY FILTER */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/60 border border-red-700 text-gray-200 px-4 py-2 rounded-lg"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* GALLERY GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-red-800/40 hover:border-red-500 transition group cursor-pointer relative"
              onClick={() => setSelectedImageIndex(i)}
            >
              <img
                src={img.url}
                className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                alt={img.caption || "Gallery image"}
              />

              {img.category && (
                <div className="absolute top-1 left-2 text-xs bg-red-600/80 px-2 py-1 rounded shadow">
                  {img.category}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="text-center text-gray-400 py-10 animate-pulse">
            Loading more photos...
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            key="modal"
            onClick={() => setSelectedImageIndex(null)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              src={images[selectedImageIndex].url}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            />

            {/* NAVIGATION */}
            <button
              className="absolute left-10 text-white text-4xl"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              ‹
            </button>
            <button
              className="absolute right-10 text-white text-4xl"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
