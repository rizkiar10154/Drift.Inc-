// app/admin/components/GalleryManager.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from "@/constants/categories";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload with progress (safe JSON)
async function uploadWithProgress(
  supabaseUrl: string,
  bucket: string,
  filePath: string,
  file: File,
  onProgress: (pct: number) => void
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 300) {
          const text = xhr.responseText;
          if (!text) return resolve({});
          try {
            resolve(JSON.parse(text));
          } catch {
            resolve({});
          }
        } else {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.open(
      "POST",
      `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`
    );
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    );

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

type GalleryItem = {
  id: string;
  url: string;
  category: string;
  caption: string;
  uploaded_at: string;
};

export default function GalleryManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<FileList | null>(null);
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, number>
  >({});

  const [category, setCategory] = useState<GalleryCategory>(
    GALLERY_CATEGORIES[0]
  );
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [multiMode, setMultiMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [captionSaving, setCaptionSaving] = useState<string | null>(null);

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

  // -------------------------
  // File handling
  // -------------------------
  const handleFileChange = (e: any) => {
    const list = e.target.files as FileList | null;
    setFiles(list);

    const previews = Array.from(list || []).map((file: File) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      duration: null,
    }));

    setPreviewFiles(previews);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files as FileList;
    setFiles(dropped);

    const previews = Array.from(dropped).map((file: File) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      duration: null,
    }));

    setPreviewFiles(previews);
  };

  // -------------------------
  // Upload
  // -------------------------
  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setMessage("");
    setUploadProgress({});

    const fileArray = Array.from(files as FileList) as File[];

    for (const file of fileArray) {
      const id = `${file.name}-${Date.now()}`;
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      setUploadProgress((p) => ({ ...p, [id]: 0 }));

      await uploadWithProgress(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        "gallery",
        filename,
        file,
        (pct: number) => {
          setUploadProgress((p) => ({ ...p, [id]: pct }));
        }
      );

      const { data } = supabase.storage
        .from("gallery")
        .getPublicUrl(filename);

      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.publicUrl,
          category,
          caption: "",
        }),
      });
    }

    setLoading(false);
    setPreviewFiles([]);
    setFiles(null);
    setMessage("Upload completed!");

    await loadGallery();
    setTimeout(() => setUploadProgress({}), 600);
  };

  // -------------------------
  // SAVE CAPTION (patched)
  // -------------------------
  const saveCaption = async (id: string, caption: string) => {
    setCaptionSaving(id);

    try {
      const res = await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, caption }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : { success: true };

      if (json.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, caption } : it))
        );
      }
    } catch (err) {
      console.error("Caption update failed:", err);
    }

    setCaptionSaving(null);
  };

  // -------------------------
  // Delete
  // -------------------------
  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;

    setLoading(true);
    await fetch("/api/gallery", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setLoading(false);
    await loadGallery();
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedItems.size} items?`)) return;

    setLoading(true);

    for (const id of selectedItems) {
      await fetch("/api/gallery", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    }

    setSelectedItems(new Set());
    setLoading(false);
    await loadGallery();
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Gallery Manager</h1>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-black/40 border border-red-700 rounded-xl">
        <h2 className="text-xl mb-4">Upload Photos / Videos</h2>

        <div className="flex items-center gap-4 mb-4">
          <select
            className="flex-1 bg-black/50 border border-red-700 px-3 py-2 rounded text-white"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as GalleryCategory)
            }
          >
            {GALLERY_CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Choose Files
          </button>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-red-700 rounded-xl p-8 text-center text-gray-300 hover:bg-white/5 cursor-pointer transition mb-6"
        >
          Drag & drop files here or click to browse
        </div>

        {previewFiles.length > 0 && (
          <>
            <div className="flex justify-between mb-4">
              <span className="text-green-300">
                {previewFiles.length} file selected
              </span>

              <button
                onClick={() => {
                  setPreviewFiles([]);
                  setFiles(null);
                }}
                className="text-red-400 underline"
              >
                Remove all
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {previewFiles.map((item, i) => (
                <div
                  key={i}
                  className="relative rounded overflow-hidden border border-white/10"
                >
                  {item.type.startsWith("video") ? (
                    <video
                      src={item.url}
                      className="w-full h-32 object-cover"
                      muted
                      onLoadedMetadata={(e: any) => {
                        item.duration =
                          e.target.duration.toFixed(1);
                        setPreviewFiles([...previewFiles]);
                      }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      className="w-full h-32 object-cover"
                    />
                  )}

                  {item.duration && (
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {item.duration}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Progress */}
        {Object.entries(uploadProgress).map(
          ([id, pct]: [string, number]) => (
            <div key={id} className="mb-3">
              <div className="text-xs text-white mb-1">
                {pct}%
              </div>
              <div className="w-full bg-white/10 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        )}

        <button
          onClick={handleUpload}
          disabled={loading || previewFiles.length === 0}
          className={`px-4 py-2 rounded font-semibold ${
            loading || previewFiles.length === 0
              ? "bg-green-800/40 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="text-green-400 mt-4">{message}</p>
        )}
      </div>

      {/* Multi Delete */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            setMultiMode(!multiMode);
            setSelectedItems(new Set());
          }}
          className="bg-yellow-600 px-4 py-1 rounded"
        >
          {multiMode ? "Cancel Multi Delete" : "Multi Delete"}
        </button>

        {multiMode && selectedItems.size > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-red-700 px-4 py-1 rounded"
          >
            Delete Selected ({selectedItems.size})
          </button>
        )}
      </div>

      {/* Gallery */}
      <h2 className="text-xl mb-4">Existing Media</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative border border-red-700 rounded-lg overflow-hidden"
          >
            {multiMode && (
              <input
                type="checkbox"
                className="absolute top-2 left-2 w-5 h-5 z-10"
                checked={selectedItems.has(item.id)}
                onChange={(e) => {
                  const next = new Set(selectedItems);
                  if (e.target.checked) next.add(item.id);
                  else next.delete(item.id);
                  setSelectedItems(next);
                }}
              />
            )}

            {/\.(mp4|mov|avi|mkv|webm)$/i.test(item.url) ? (
              <video
                src={item.url}
                controls
                className="w-full h-40 object-cover"
              />
            ) : (
              <img
                src={item.url}
                className="w-full h-40 object-cover"
              />
            )}

            <div className="px-3 pt-2 text-sm text-red-300">
              {item.category}
            </div>

            {/* 
              ✔ Caption Input (no warnings)
              ✔ Save button
            */}
            <div className="px-3 pb-3">
              <input
                id={`caption-${item.id}`}
                defaultValue={item.caption}
                className="w-full bg-black/60 border border-white/20 px-2 py-1 rounded text-sm mb-2"
                placeholder="Enter caption..."
              />

              <button
                onClick={() => {
                  const value = (
                    document.getElementById(
                      `caption-${item.id}`
                    ) as HTMLInputElement
                  ).value;

                  saveCaption(item.id, value);
                }}
                className={`px-3 py-1 rounded text-xs ${
                  captionSaving === item.id
                    ? "bg-yellow-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {captionSaving === item.id
                  ? "Saving..."
                  : "Save Caption"}
              </button>
            </div>

            {!multiMode && (
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute top-2 right-2 bg-red-600 px-3 py-1 rounded text-xs"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
