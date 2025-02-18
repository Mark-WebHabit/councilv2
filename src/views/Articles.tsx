import { useContext, useState, ChangeEvent, FormEvent } from "react";
import NavBar from "../components/NavBar";
import RecentArticle from "../components/RecentArticle";
import {
  FaLightbulb,
  FaTrashAlt,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { DataContext } from "../../context/DataContext";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";

function Articles() {
  const { isAdmin } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    logo: string | File;
    assets: File[];
    title: string;
    body: string;
  }>({
    logo: "",
    assets: [],
    title: "",
    body: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      if (name === "assets") {
        setFormData({ ...formData, assets: Array.from(files) });
      } else {
        setFormData({ ...formData, [name]: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleQuillChange = (value: string) => {
    setFormData({ ...formData, body: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate logo
    if (formData.logo instanceof File) {
      const logoFile = formData.logo;
      const validLogoTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validLogoTypes.includes(logoFile.type)) {
        alert("Logo must be a JPG, JPEG, or PNG file.");
        return;
      }
      if (logoFile.size > 3 * 1024 * 1024) {
        alert("Logo must be less than 3MB.");
        return;
      }
    }

    // Validate assets
    for (const assetFile of formData.assets) {
      const validAssetTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4",
        "video/avi",
      ];
      if (!validAssetTypes.includes(assetFile.type)) {
        alert("Assets must be images or videos.");
        return;
      }
    }

    // Handle form submission logic here
    console.log(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="max mx-auto">
      <NavBar />

      <div className="w-screen max-w-[1500px] mx-auto pt-[80px] screen">
        <div className="w-full h-full bg-[var(--fadebg)] rounded-3xl relative flex p-8 pb-2 ">
          <div
            className="absolute flex flex-col justify-center items-center bg-[var(--darkpurple)] h-[300px] border-8 rounded-2xl px-2 left-[100%] top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <img src="/images/add.png" alt="ADD" />
            <p className="text-xl uppercase font-bold text-white">UPLOAD</p>
          </div>

          <div className="flex-1 overflow-scroll no-scrollbar">
            <div className="author flex items-center">
              <img
                src="/images/logo.jpg"
                alt="Logo"
                className="w-[50p6] h-[60px] rounded-full"
              />
              <p className="max-w-[300px] text-xl uppercase font-bold text-white ml-4">
                The LATHE HS & Ang LALIK Hayskul
              </p>
            </div>

            <div className="actions flex items-center mt-2 font-bold justify-between max-w-[500px]">
              <small className="text-white text-xs">
                POSTED ON 02/01/2025
                <br />
                Latest Post
              </small>
              {isAdmin && (
                <>
                  <div className="flex items-center">
                    <FaTrashAlt className="text-2xl text-white/60" />
                    <p className="px-4 py bg-red-700 text-white border-6 rounded-full border-red-900">
                      DELETE
                    </p>
                  </div>
                  <div className="flex items-center">
                    <FaLightbulb className="text-2xl text-yellow-300" />
                    <p className="px-4 py bg-green-700 text-white border-6 rounded-full border-green-900">
                      HIGHLIGHT
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="title my-4">
              <h1 className="text-3xl uppercase text-white font-bold max-w-[700px]">
                Batang IS craft creativity and culture at PASINAYA 2025
              </h1>
            </div>

            <div className="images flex items-center justify-start gap-4 ">
              <FaArrowLeft className="text-3xl text-white/80" />
              <img
                src="/images/test.jpg"
                alt="Image"
                className="h-full max-h-[300px] aspect-video"
              />
              <FaArrowRight className="text-3xl text-white/80" />
            </div>

            <div className="body mt-5">
              <p className="text-xl text-white max-w-[700px] uppercase">
                hosting, and directing process—inspiring young minds to ignite
                creativity and embrace cultural diversity. The event also
                showcased Paseo Museo, a museum tour that opens opportunities to
                everyone to see
              </p>
            </div>
          </div>

          {/* recent */}
          <div className="flex flex-col pt-16 flex-[0.7]">
            <h1 className="text-2xl text-white font-bold">RECENTS</h1>
            <div className="flex-1 overflow-scroll no-scrollbar flex flex-col gap-16">
              <RecentArticle />
              <RecentArticle />
              <RecentArticle />
              <RecentArticle />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Article</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Logo</label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">
                  Assets (Images/Videos)
                </label>
                <input
                  type="file"
                  name="assets"
                  onChange={handleInputChange}
                  className="mt-1 block w-full"
                  multiple
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Body</label>
                <ReactQuill
                  value={formData.body}
                  onChange={handleQuillChange}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-4 px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Articles;
