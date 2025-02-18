import { useState, useContext } from "react";
import { FaEllipsisV, FaLightbulb, FaTrash } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";

interface Media {
  media: string | null;
  type: string | null;
}

interface EventProps {
  event: Media[];
}

function Event({ event }: EventProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const { isAdmin } = useContext(DataContext);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % event.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + event.length) % event.length
    );
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleHighlight = () => {
    // Add highlight functionality here
    console.log("Highlight clicked");
  };

  const handleDelete = () => {
    // Add delete functionality here
    console.log("Delete clicked");
  };

  return (
    <div className="event flex items-center max-w-[800px]  flex-col w-full p-4 rounded-2xl mx-auto bg-[var(--postbg)] my-8 relative">
      <p className="text-md font-bold mb-2 text-white uppercase  w-full text-left">
        EVENT DATE: 02/25/2025
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
            POSTED ON 2/13/2025
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
                <FaLightbulb />
                Highlight
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col  gap-1 lg:gap-2">
        <div className="w-full bg-white mt-4 p-4 rounded">
          <p className="uppercase text-sm font-semibold">
            Are you ready to create memories and express your feelings? If you
            have something you want to say or a moment you want to cherish, this
            is the chance. Never miss a moment create a special memory. Come,
            share, and show the love in a memorable way!
            <br />
            #PAKISABI
            <br />
            #BatStateUISSHSSC
            <br />
            #EmbodyingEmminentExcellence
          </p>
        </div>
        {event[currentIndex]?.media && (
          <div className="mt-0  w-[100%] h-[500px] flex items-center justify-center px-4 py-0">
            <img
              src="/images/left.png"
              alt=""
              className="arrow"
              onClick={handlePrev}
            />
            {event[currentIndex].type === "image" ? (
              <img
                src={`/images/${event[currentIndex].media}`}
                className="w-full h-full object-center"
                alt=""
              />
            ) : (
              <video className="w-full" controls>
                <source
                  src={`/images/${event[currentIndex].media}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
            <img
              src="/images/left.png"
              alt=""
              className="arrow rotate-180"
              onClick={handleNext}
            />
          </div>
        )}
      </div>
      <div className="w-full flex items-center justify-between px-2 mt-2">
        {/* count likes */}
        <div className="flex items-center gap-4">
          <div className="w-fit about-button aspect-square rounded-full p-4 grid place-items-center">
            <img
              src="/images/liked.png"
              className="w-[35px] aspect-square"
              alt="Like  "
            />
          </div>

          <p className="text-white text-xl">144</p>
        </div>

        {/* count views here */}

        <div>
          <p className="text-3xl text-white">
            85
            <span className="text-[18px] ml-2">views</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Event;
