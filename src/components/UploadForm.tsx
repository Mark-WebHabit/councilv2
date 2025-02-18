import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { FaUpload } from "react-icons/fa";

interface UploadFormProps {
  onSubmit: (data: any) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm();
  const [editorContent, setEditorContent] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleFormSubmit = (data: any) => {
    const files = data.media;
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > 3 * 1024 * 1024) {
        setFileError("File size exceeds 3MB");
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setFileError("Invalid file type. Only images and videos are allowed.");
        return;
      }

      validFiles.push(file);
    }

    const formData = {
      ...data,
      content: editorContent,
      media: validFiles,
    };

    console.log(formData);
    onSubmit(formData);
    reset();
    setEditorContent("");
    setFileError(null);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-4 bg-white rounded shadow-md"
    >
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Rich Text
        </label>
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          className="bg-white h-[150px]"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Media (optional, max 3MB each)
        </label>
        <input
          type="file"
          {...register("media")}
          multiple
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <FaUpload />
        Submit
      </button>
    </form>
  );
};

const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "direction",
  "align",
  "link",
];

export default UploadForm;
