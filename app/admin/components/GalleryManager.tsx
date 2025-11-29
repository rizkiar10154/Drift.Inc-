//app/admin/components/GalleryManager.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from "@/constants/categories";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GalleryItem = {
  id: string;
  url: string;
  category: string;
  caption: string;
  uploaded_at: string;
};

export default function GalleryManager() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<GalleryCategory>(
    GALLERY_CATEGORIES[0]
  );
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load existing gallery items
  const loadGallery = async () => {
    setLoading(true);

    const res = await fetch("/api/gallery?limit=500");
    const json = await res.json();

    if (json.success) setItems(json.data);

    setLoading(false);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Direct upload to Supabase Storage
  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setMessage("");
    setLoading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "file";
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const filePath = `public/${filename}`;

      // 1) Upload directly to storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      // 2) Get public URL
      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3) Insert into DB
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: publicUrl,
          category,
          caption: "",
        }),
      });
    }

    setMessage("Upload completed!");
    setFiles(null);
    await loadGallery();
    setLoading(false);
  };

  // Delete item (DB + storage)
  const deleteItem = async (id: string) => {
    await fetch("/api/gallery", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    await loadGallery();
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Gallery Manager</h1>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-black/40 border border-red-700 rounded-xl">
        <h2 className="text-xl mb-4">Upload Photos / Videos</h2>

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mb-4 block"
        />

        {/* Category Dropdown using constants */}
        <select
          className="bg-black/60 border border-red-700 px-3 py-2 rounded mb-4"
          value={category}
          onChange={(e) => setCategory(e.target.value as GalleryCategory)}
        >
          {GALLERY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-red-600 px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && <p className="mt-4 text-green-400">{message}</p>}
      </div>

      {/* Gallery List */}
      <h2 className="text-xl mb-4">Existing Media</h2>

      {items.length === 0 && !loading && (
        <p className="text-gray-400">No media found.</p>
      )}

      {loading && <p className="text-gray-400">Loading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative border border-red-700 rounded-lg overflow-hidden"
          >
            {/* Show image or video */}
            {item.url.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? (
              <video
                src={item.url}
                controls
                className="w-full h-40 object-cover"
              />
            ) : (
              <img src={item.url} className="w-full h-40 object-cover" />
            )}

            <div className="p-3 text-sm">{item.category}</div>

            <button
              onClick={() => deleteItem(item.id)}
              className="absolute top-2 right-2 bg-red-600 px-3 py-1 rounded text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
