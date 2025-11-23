"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import axios from "axios";

type GalleryItem = {
  id?: string;
  url: string;
  category?: string;
  caption?: string;
  uploaded_at?: string;
  is_deleted?: boolean;
};

export default function GalleryManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // CATEGORY ONLY (Option 1)
  const [selectedCategory, setSelectedCategory] = useState("");

  // staging area
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);

  // existing photos
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // FETCH PHOTOS
  // ---------------------------
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}&limit=200` : `?limit=200`;

      const res = await fetch(`/api/gallery${q}`, { cache: "no-store" });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setPhotos(json.data);
      } else {
        setPhotos([]);
      }
    } catch (err) {
      console.error("fetchPhotos error:", err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch on load + category change
  useEffect(() => {
    fetchPhotos();
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // ---------------------------
  // FILE SELECTION
  // ---------------------------
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected]);

    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.currentTarget.value = "";
  };

  // remove file from staging
  const removeSelectedFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));

    setCaptions((prev) => {
      const copy = { ...prev };
      delete copy[index];
      const shifted: Record<number, string> = {};
      let j = 0;
      const keys = Object.keys(copy)
        .map((k) => Number(k))
        .sort((a, b) => a - b);
      for (const k of keys) {
        shifted[j++] = copy[k];
      }
      return shifted;
    });
  };

  const handleCaptionChange = (index: number, value: string) => {
    setCaptions((prev) => ({ ...prev, [index]: value }));
  };

  // ---------------------------
  // UPLOAD PHOTOS
  // ---------------------------
  const handleUpload = async () => {
    if (!selectedCategory) {
      alert("Please select a category before uploading.");
      return;
    }

    if (files.length === 0) {
      alert("No files selected.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();

      files.forEach((f, idx) => {
        form.append("files", f);
        form.append(`caption_${idx}`, captions[idx] || "");
      });

      form.append("category", selectedCategory);

      const res = await axios.post("/api/gallery/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120_000,
      });

      if (res?.data?.success) {
        // res.data.data is array of inserted items
        await fetchPhotos();

        previews.forEach((p) => URL.revokeObjectURL(p));
        setFiles([]);
        setPreviews([]);
        setCaptions({});
        const uploadedCount = Array.isArray(res.data.data) ? res.data.data.length : 0;
        alert(`Uploaded ${uploadedCount} image(s).`);
      } else {
        alert("Upload failed: " + (res.data?.message || "Unknown"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------
  // DELETE PHOTO
  // ---------------------------
  const handleDeletePhoto = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this photo?")) return;

    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, permanent: false }),
      });

      const json = await res.json();
      if (json.success) {
        await fetchPhotos();
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed.");
    }
  };

  // ---------------------------
  // UI (no changes)
  // ---------------------------
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Category + Upload Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Category */}
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border border-zinc-700 px-4 py-2 rounded text-white min-w-[220px]"
          >
            <option value="">Select Category</option>
            <option value="Race Day">Race Day</option>
            <option value="Track & Karts">Track & Karts</option>
            <option value="Customer Moments">Customer Moments</option>
            <option value="Events">Events</option>
            <option value="Highlight">Highlight</option>
          </select>
        </div>

        {/* Buttons */}
        <div>
          <label className="block text-sm text-zinc-300 mb-1 invisible">btn</label>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              disabled={uploading}
            >
              Choose Photos
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              disabled={uploading || files.length === 0}
            >
              {uploading ? "Uploading..." : "Upload Selected"}
            </button>
          </div>
        </div>
      </div>

      {/* Staging Preview */}
      {previews.length > 0 && (
        <div>
          <h4 className="text-sm text-zinc-300 mb-2">Selected photos (staging)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative border rounded overflow-hidden p-2 bg-zinc-900">
                <img src={src} className="w-full h-40 object-cover rounded" />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={captions[idx] || ""}
                  onChange={(e) => handleCaptionChange(idx, e.target.value)}
                  className="mt-2 w-full p-2 bg-transparent border border-zinc-700 rounded text-white"
                />
                <button
                  onClick={() => removeSelectedFile(idx)}
                  className="mt-2 w-full bg-red-600 py-1 rounded text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Gallery */}
      <div>
        <h3 className="mb-3 text-lg">Gallery ({selectedCategory || "All"})</h3>

        {loading ? (
          <p>Loading...</p>
        ) : photos.length === 0 ? (
          <p className="italic text-zinc-400">No images</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative group bg-zinc-900 rounded overflow-hidden">
                <img src={p.url} className="w-full h-40 object-cover" alt={p.caption || "gallery"} />

                {p.caption && <div className="p-2 text-sm text-white">{p.caption}</div>}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => window.open(p.url, "_blank")}
                    className="mr-2 bg-white/10 px-2 py-1 rounded"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="bg-red-600 px-2 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-1 py-0.5 rounded text-zinc-200">
                  {p.category || ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
