import { useState, useContext, useRef, useEffect } from "react";
import { FaEllipsisV, FaLightbulb, FaTrash } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";
import { Event as TypeEvent } from "../../data/Event";
import { formatDateString } from "../../utilities/date";
import { Like } from "../../data/Like";
import { auth, db } from "../../firebase";
import { ref, update, remove, set, get } from "firebase/database";
import useIntersectionObserver from "../../hooks/useIntersectionOberver";
export type EventProps = {
  event: TypeEvent;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

function Event({ event, setError }: EventProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const eventsRef = useRef(null);

  const { isAdmin, eventLikes } = useContext(DataContext);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % event.media.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + event.media.length) % event.media.length
    );
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleHighlight = async () => {
    try {
      const postRef = ref(db, `events/${event.id}`);
      await update(postRef, { isHighlight: !event.isHighlight });
      setMenuOpen(false);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const handleDelete = async () => {
    try {
      const postRef = ref(db, `events/${event.id}`);
      await remove(postRef);
      setMenuOpen(false);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const userHasLiked = eventLikes
    .find((pst: Like) => pst.id === event.id)
    ?.users?.includes(auth?.currentUser?.uid);

  const handleLike = async () => {
    try {
      const eventLike = eventLikes.find((pst: Like) => pst.id === event.id);
      const userId = auth?.currentUser?.uid;

      if (!userId) {
        setError("User not authenticated.");
        return;
      }

      const eventLikesRef = ref(db, `eventLikes/${event.id}`);
      let updatedEventLike;

      if (eventLike && eventLike.users) {
        const userIndex = eventLike.users.indexOf(userId);
        if (userIndex > -1) {
          // User has already liked the post, remove their ID
          updatedEventLike = {
            ...eventLike,
            users: eventLike.users.filter((id: string) => id !== userId),
          };
        } else {
          // User has not liked the post, add their ID
          updatedEventLike = {
            ...eventLike,
            users: [...eventLike.users, userId],
          };
        }
      } else {
        // No likes for this post yet, create a new entry
        updatedEventLike = { id: event.id, users: [userId] };
      }

      await set(eventLikesRef, updatedEventLike);
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred.");
    }
  };

  const handleView = async (element: Element) => {
    if (element === eventsRef.current) {
      const userId = auth?.currentUser?.uid;
      if (!userId) return;

      const viewsRef = ref(db, `views/${event.id}`);
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
    observe(eventsRef.current);
  }, [observe]);

  return (
    <div
      className="event flex items-center max-w-[800px]  flex-col w-full p-4 rounded-2xl mx-auto bg-[var(--postbg)] my-8 relative"
      ref={eventsRef}
    >
      <p className="text-md font-bold mb-2 text-white uppercase  w-full text-left">
        EVENT DATE: {event.eventDate}
      </p>
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
            POSTED ON {formatDateString(event.datePosted)}
          </small>
          <br />
        </div>

        <div className="ml-auto relative">
          {isAdmin && (
            <button onClick={toggleMenu} className="text-white">
              <FaEllipsisV />
            </button>
          )}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={handleHighlight}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <FaLightbulb color="green" />
                {event.isHighlight ? "UnHighlight" : "Highlight"}
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
      </div>
      <div className="flex   w-full flex-col  gap-1 lg:gap-2">
        <div className=" bg-white mt-4 p-4 rounded">
          <div
            className="uppercase  text-sm font-semibold"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </div>
        {event?.media?.length > 0 && event?.media[currentIndex] && (
          <div className="mt-0  w-[100%] h-[500px] flex items-center justify-center px-4 py-0">
            {event?.media?.length > 1 && (
              <img
                src="/images/left.png"
                alt=""
                className="arrow"
                onClick={handlePrev}
              />
            )}
            {event?.media[currentIndex].type === "image" ? (
              <img
                src={`${event?.media[currentIndex].url}`}
                className="w-full h-full object-center"
                alt=""
              />
            ) : (
              <video className="w-full" controls>
                <source
                  src={`${event?.media[currentIndex].url}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
            {event?.media?.length > 1 && (
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
      <div className="w-full flex items-center justify-between px-2 mt-2">
        {/* count likes */}
        <div className="flex items-center gap-4">
          <div
            className="w-fit about-button aspect-square rounded-full p-4 grid place-items-center"
            onClick={handleLike}
          >
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

          <p className="text-white text-xl">{event.likes?.length || 0}</p>
        </div>

        {/* count views here */}

        <div>
          <p className="text-3xl text-white">
            {event.views || 0}
            <span className="text-[18px] ml-2">views</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Event;
