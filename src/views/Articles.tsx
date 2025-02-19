import emailjs from "emailjs-com";
import { useContext, useState, ChangeEvent, FormEvent, useEffect } from "react";
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
import { Article, Media } from "../../data/Article";
import Modal from "../components/Modal";
import { storage, db } from "../../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { ref as dbRef, push, ref, remove, update } from "firebase/database";
import { formatDateString } from "../../utilities/date";
import { config } from "../../utilities/emailjs";
import { BASE_URL } from "../../utilities/BASE_URL";

function Articles() {
  const { isAdmin } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileAssets, setFileAssets] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Article>({
    logo: "",
    body: "",
    datePosted: "",
    author: "",
    title: "",
    assets: [],
    isHighlight: false,
  });
  const [error, setError] = useState("");
  const [active, setActive] = useState<Article | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { articles, users } = useContext(DataContext);

  useEffect(() => {
    setCurrentIndex(0);
  }, [active]);

  useEffect(() => {
    if (articles) {
      const latest = articles.find((art: Article) => art?.latest);

      if (latest) {
        setActive(latest);
      }
    } else {
      setActive(null);
    }
  }, [articles]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      if (name === "assets") {
        const assets: File[] = Array.from(files);
        setFileAssets(assets);
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.logo) {
      setError("Logo is required");
      return;
    }

    // Validate logo
    if (formData.logo instanceof File) {
      const logoFile = formData.logo;
      const validLogoTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validLogoTypes.includes(logoFile.type)) {
        setError("Logo must be a JPG, JPEG, or PNG file.");
        return;
      }
      if (logoFile.size > 3 * 1024 * 1024) {
        setError("Logo must be less than 3MB.");
        return;
      }
    }

    // Validate assets
    if (fileAssets.length === 0) {
      setError("Please upload at least one asset.");
      return;
    }
    for (const asset of fileAssets) {
      const validAssetTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4",
        "video/avi",
      ];
      if (!validAssetTypes.includes(asset.type)) {
        setError("Assets must be images or videos.");
        return;
      }
    }

    // Validate body
    if (!formData.body.trim()) {
      setError("Body content cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      // Upload logo
      let logoUrl = "";
      if (formData.logo instanceof File) {
        const logoStorageRef = storageRef(
          storage,
          `logos/${formData.logo.name}`
        );
        await uploadBytes(logoStorageRef, formData.logo);
        logoUrl = await getDownloadURL(logoStorageRef);
      }

      // Upload assets
      const assetUrls: Media[] = [];
      for (const asset of fileAssets) {
        const assetStorageRef = storageRef(storage, `assets/${asset.name}`);
        await uploadBytes(assetStorageRef, asset);
        const assetUrl = await getDownloadURL(assetStorageRef);
        assetUrls.push({ url: assetUrl, type: asset.type });
      }

      // Save article to Realtime Database
      const articlesRef = dbRef(db, "articles");
      await push(articlesRef, {
        ...formData,
        logo: logoUrl,
        assets: assetUrls,
        datePosted: new Date().toISOString(),
      });
      setIsModalOpen(false);
      // Reset form
      setFormData({
        logo: "",
        body: "",
        datePosted: "",
        author: "",
        title: "",
        assets: [],

        isHighlight: false,
      });
      setFileAssets([]);

      if (users?.length > 0) {
        for (const usr of users.filter((usr: any) => usr?.email)) {
          const templateParams = {
            from_name: "ISSCOHUB",
            message: "A new article has been uploaded!.",
            to_email: usr.email,
            link: `${BASE_URL}/articles`,
          };

          await emailjs.send(
            config[0],
            config[1],

            templateParams,
            config[2]
          );
        }
      }
    } catch (error) {
      console.error("Error uploading files: ", error);
      setError("Failed to upload files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % active!.assets.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + active!.assets.length) % active!.assets.length
    );
  };

  const handleHighlight = async () => {
    if (!active) {
      return;
    }
    try {
      const articleRef = ref(db, `articles/${active?.id}`);
      await update(articleRef, { isHighlight: !active.isHighlight });
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const handleDelete = async () => {
    if (!active) {
      return;
    }
    try {
      const articleRef = ref(db, `articles/${active?.id}`);
      await remove(articleRef);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  return (
    <div className="max mx-auto">
      <NavBar />
      {error && (
        <Modal type="error" text={error} onClose={() => setError("")} />
      )}
      <div className="w-screen max-w-[1500px] mx-auto pt-[80px] screen">
        <div className="w-full h-full bg-[var(--fadebg)] rounded-3xl relative flex p-8 pb-2 ">
          <div
            className="absolute flex flex-col justify-center items-center bg-[var(--darkpurple)] h-[300px] border-8 rounded-2xl px-2 left-[100%] top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <img src="/images/add.png" alt="ADD" />
            <p className="text-xl uppercase font-bold text-white">UPLOAD</p>
          </div>

          {articles?.length > 0 && active && (
            <div className="flex-1 overflow-scroll no-scrollbar">
              <div className="author flex items-center">
                <img
                  src={
                    active?.logo instanceof File
                      ? URL.createObjectURL(active.logo)
                      : active?.logo
                  }
                  alt="Logo"
                  className="w-[50p6] h-[60px] rounded-full"
                />
                <p className="max-w-[300px] text-xl uppercase font-bold text-white ml-4">
                  {active.author}
                </p>
              </div>

              <div className="actions flex items-center mt-2 font-bold justify-between max-w-[500px]">
                <small className="text-white text-xs">
                  POSTED ON {formatDateString(active.datePosted)}
                  <br />
                  {active?.latest && "Latest Post"}
                </small>
                {isAdmin && (
                  <>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={handleDelete}
                    >
                      <FaTrashAlt className="text-2xl text-white/60" />
                      <p className="px-4 py bg-red-700 text-white border-6 rounded-full border-red-900">
                        DELETE
                      </p>
                    </div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={handleHighlight}
                    >
                      <FaLightbulb className="text-2xl text-yellow-300" />
                      <p className="px-4 py bg-green-700 text-white border-6 rounded-full border-green-900">
                        {active?.isHighlight ? "UNHIGHLIGHT" : "HIGHLIGHT"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="title my-4">
                <h1 className="text-3xl uppercase text-white font-bold max-w-[700px]">
                  {active.title}
                </h1>
              </div>

              <div className="images flex items-center justify-start gap-4 ">
                {active.assets?.length > 1 && (
                  <FaArrowLeft
                    className="text-3xl text-white/80"
                    onClick={handlePrev}
                  />
                )}
                {active.assets[currentIndex]?.type.startsWith("video/") ? (
                  <video
                    src={active.assets[currentIndex]?.url}
                    controls
                    className="h-full max-h-[300px] aspect-video"
                  />
                ) : (
                  <img
                    src={active.assets[currentIndex]?.url}
                    alt="Image"
                    className="h-full max-h-[300px] aspect-video"
                  />
                )}
                {active.assets?.length > 1 && (
                  <FaArrowRight
                    className="text-3xl text-white/80"
                    onClick={handleNext}
                  />
                )}
              </div>

              <div className="body mt-5">
                <div
                  className="text-xl text-white max-w-[700px] uppercase"
                  dangerouslySetInnerHTML={{
                    __html: active.body,
                  }}
                />
              </div>
            </div>
          )}
          {articles?.length <= 0 && (
            <h1 className="text-center text-white text-5xl  w-full">
              No Articles Posted Yet
            </h1>
          )}

          {/* recent */}
          {articles?.length > 0 && (
            <div className="flex flex-col pt-8 flex-[0.5]">
              <h1 className="text-2xl text-white font-bold mb-8">RECENTS</h1>
              <div className="flex-1 overflow-scroll no-scrollbar flex flex-col gap-16">
                {articles?.length > 0 &&
                  articles.map((article: Article, i: number) => {
                    return (
                      <RecentArticle
                        key={i}
                        article={article}
                        setActive={setActive}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Article</h2>
            <form
              onSubmit={handleSubmit}
              className="max-h-[700px] overflow-scroll"
            >
              <div className="mb-4">
                <label className="block text-gray-700">Logo</label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleInputChange}
                  className="mt-1 block w-full outline-0"
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
                  className="mt-1 block w-full outline-0"
                  multiple
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 border-2 px-3 border-blue-500 outline-0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 border-2 px-3 border-blue-500 outline-0"
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
                {!loading && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-4 px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {loading ? "Uploading..." : "Submit"}
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
