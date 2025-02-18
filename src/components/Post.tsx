import { useContext, useRef, useState, useEffect } from "react";
import { FaEllipsisV, FaLightbulb, FaTrash } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";

import { Post as TypePost } from "../../data/Post";
import { ref, update, remove, set, get } from "firebase/database";
import { auth, db } from "../../firebase";
import { Like } from "../../data/Like";
import useIntersectionObserver from "../../hooks/useIntersectionOberver";

export type PostProps = {
  post: TypePost;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

function Post({ post, setError }: PostProps) {
  console.log(post);

  const postRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const { postLikes } = useContext(DataContext);

  const { isAdmin } = useContext(DataContext);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % post.media?.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + post.media?.length) % post.media?.length
    );
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleHighlight = async () => {
    try {
      const postRef = ref(db, `posts/${post.id}`);
      await update(postRef, { isHighlight: !post.isHighlight });
      setMenuOpen(false);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const handleDelete = async () => {
    try {
      const postRef = ref(db, `posts/${post.id}`);
      await remove(postRef);
      setMenuOpen(false);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const handleLike = async () => {
    try {
      const postLike = postLikes.find((pst: Like) => pst.id === post.id);
      const userId = auth?.currentUser?.uid;

      if (!userId) {
        setError("User not authenticated.");
        return;
      }

      const postLikesRef = ref(db, `postLikes/${post.id}`);
      let updatedPostLike;

      if (postLike && postLike.users) {
        const userIndex = postLike.users.indexOf(userId);
        if (userIndex > -1) {
          // User has already liked the post, remove their ID
          updatedPostLike = {
            ...postLike,
            users: postLike.users.filter((id: string) => id !== userId),
          };
        } else {
          // User has not liked the post, add their ID
          updatedPostLike = {
            ...postLike,
            users: [...postLike.users, userId],
          };
        }
      } else {
        // No likes for this post yet, create a new entry
        updatedPostLike = { id: post.id, users: [userId] };
      }

      await set(postLikesRef, updatedPostLike);
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred.");
    }
  };

  const userHasLiked = postLikes
    .find((pst: Like) => pst.id === post.id)
    ?.users?.includes(auth?.currentUser?.uid);

  const handleView = async (element: Element) => {
    if (element === postRef.current) {
      const userId = auth?.currentUser?.uid;
      if (!userId) return;

      const viewsRef = ref(db, `views/${post.id}`);
      const snapshot = await get(viewsRef);
      let updatedViews;

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (!data.users.includes(userId)) {
          updatedViews = {
            ...data,
            users: [...data.users, userId],
          };
        }
      } else {
        updatedViews = { users: [userId] };
      }

      if (updatedViews) {
        await set(viewsRef, updatedViews);
      }
    }
  };

  const observe = useIntersectionObserver(handleView);

  useEffect(() => {
    observe(postRef.current);
  }, [observe]);

  return (
    <div
      ref={postRef}
      className="post max-w-[800px] flex items-center flex-col w-full p-4 rounded-2xl mx-auto bg-[var(--postbg)] my-8 relative"
    >
      <div className="author flex items-center gap-4 w-full">
        <img
          src="/images/logo.jpg"
          className="w-[60px] aspect-square rounded-full"
          alt=""
        />
        <div>
          <p className="text-xl text-white uppercase">
            Integrated School - Senior High School Student Council
          </p>
          <small className="text-sm text-white uppercase">
            POSTED ON 2/13/2025
          </small>
        </div>
        {isAdmin && (
          <div className="ml-auto relative">
            <button onClick={toggleMenu} className="text-white">
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button
                  onClick={handleHighlight}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <FaLightbulb color="green" />
                  {post?.isHighlight ? "UnHighlight" : "Highlight"}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <FaTrash color="red" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 ">
        <div className="w-full bg-white mt-4 p-4 rounded">
          <div
            className="uppercase text-sm font-semibold w-full"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        {post?.media[currentIndex] && (
          <div className=" w-[100%] h-[500px] flex items-center justify-center px-4 py-0">
            {post?.media?.length > 1 && (
              <img
                src="/images/left.png"
                alt=""
                className="arrow"
                onClick={handlePrev}
              />
            )}
            {post?.media[currentIndex].type === "image" ? (
              <img
                src={`${post.media[currentIndex].url}`}
                className="w-full h-full object-center"
                alt=""
              />
            ) : (
              <video className="w-full" controls>
                <source
                  src={`${post.media[currentIndex].url}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
            {post?.media?.length > 1 && (
              <img
                src="/images/left.png"
                alt=""
                className="arrow rotate-180"
                onClick={handleNext}
              />
            )}
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between px-2 mt-2 ">
        {/* count likes */}
        <div className="flex items-center gap-4 " onClick={handleLike}>
          <div className="w-fit about-button aspect-square rounded-full p-4 grid place-items-center">
            {userHasLiked ? (
              <img
                src="/images/liked.png"
                className="w-[35px] aspect-square"
                alt="Like"
              />
            ) : (
              <img
                src="/images/unlike.png"
                className="w-[35px] aspect-square"
                alt="Unlike"
              />
            )}
          </div>

          <p className="text-white text-xl">{post.likes?.length || 0}</p>
        </div>

        {/* count views here */}

        <div>
          <p className="text-3xl text-white">
            {post.views || 0}
            <span className="text-[18px] ml-2">views</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Post;
