"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Loader2 } from "lucide-react";

// Dynamically import ReactQuill with SSR disabled to prevent Next.js hydration issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function QuillComponent({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-[#F7F8F4] border border-[#EBF0E6] flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#2D5A27]" />
        <span>Loading Botanical Rich Text Editor...</span>
      </div>
    ),
  }
);

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your botanical content here...",
  minHeight = "280px",
  className = "",
}) {
  const quillRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Custom Cloudinary Image Handler for Quill Toolbar
  const handleEditorImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        alert("Cloudinary credentials are missing in environment variables.");
        return;
      }

      try {
        setIsUploadingImage(true);

        // 1. Client-side compression
        const imageCompression = (await import("browser-image-compression")).default;
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", uploadPreset);

        // Show temporary loading indicator or toast: "Uploading image to cloud..."
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const imageUrl = data.secure_url;

        if (!imageUrl) {
          throw new Error(data.error?.message || "Failed to retrieve uploaded image URL");
        }

        // 3. Insert into Editor at current cursor position
        if (quillRef.current) {
          const editor = typeof quillRef.current.getEditor === "function"
            ? quillRef.current.getEditor()
            : quillRef.current.editor;
          if (editor) {
            const range = editor.getSelection(true);
            const index = range ? range.index : editor.getLength();
            editor.insertEmbed(index, "image", imageUrl);
            editor.setSelection(index + 1);
          }
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image to Cloudinary. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  // Configure Quill modules with custom image handler
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: handleEditorImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "blockquote",
    "list",
    "link",
    "image",
  ];

  return (
    <div className={`relative botanical-editor-wrapper ${className}`}>
      {/* Uploading overlay indicator */}
      {isUploadingImage && (
        <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-xs font-bold text-[#1E3F20] gap-2.5 shadow-lg border border-[#D5E2CC]">
          <Loader2 className="w-6 h-6 animate-spin text-[#2D5A27]" />
          <span>Uploading image to cloud...</span>
          <span className="text-[11px] font-normal text-gray-500">
            Compressing &amp; embedding Cloudinary photo
          </span>
        </div>
      )}

      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <style jsx global>{`
        .botanical-editor-wrapper .ql-toolbar.ql-snow {
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          border-color: #e5e7eb;
          background: #fbfcf9;
          padding: 0.6rem 0.8rem;
        }
        .botanical-editor-wrapper .ql-container.ql-snow {
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          border-color: #e5e7eb;
          background: #ffffff;
          font-family: inherit;
          font-size: 0.925rem;
          min-height: ${minHeight};
        }
        .botanical-editor-wrapper .ql-editor {
          min-height: ${minHeight};
          line-height: 1.7;
          color: #1f2937;
        }
        .botanical-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .botanical-editor-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #e5e7eb;
        }
        .botanical-editor-wrapper .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1c2b1e;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .botanical-editor-wrapper .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d5a27;
          margin-top: 1rem;
          margin-bottom: 0.4rem;
        }
        .botanical-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #2d5a27;
          background: #f2f6ef;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.75rem 0.75rem 0;
          color: #1e3f20;
          font-style: italic;
        }
        .botanical-editor-wrapper .ql-editor img {
          border-radius: 0.75rem;
          max-width: 100%;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
