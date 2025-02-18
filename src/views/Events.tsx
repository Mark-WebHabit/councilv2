import { useState, useContext, useEffect } from "react";
import NavBar from "../components/NavBar";
import Event from "../components/Event";
import UploadForm from "../components/UploadForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";
import AOS from "aos";
import "aos/dist/aos.css";

const initialEvents: { media: string | null; type: string | null }[][] = [
  [
    {
      media: "test.mp4",
      type: "video",
    },
    {
      media: "selfie.jpg",
      type: "image",
    },
  ],
  [
    {
      media: "selfie.jpg",
      type: "image",
    },
    {
      media: "test.mp4",
      type: "video",
    },
  ],
  [
    {
      media: null,
      type: null,
    },
  ],
];

function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { isAdmin } = useContext(DataContext);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 200,
      easing: "ease-in-sine",
      delay: 50,
    });
  }, []);

  const handleUploadClick = () => {
    setShowForm(!showForm);
  };

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleFormSubmit = (data: any) => {
    const newEvents = data.media
      .map((file: File) => {
        if (file) {
          return {
            media: URL.createObjectURL(file),
            type: file.type.split("/")[0],
          };
        }
        return null;
      })
      .filter(
        (event: { media: string | null; type: string | null } | null) =>
          event !== null
      );

    setEvents([...events, ...newEvents]);
  };
  return (
    <div className="max">
      <NavBar />
      <div className="w-screen pt-[80px] screen overflow-scroll no-scrollbar">
        <div className="w-full max-w-[1000px] h-full mx-auto border-x-2 border-white/10 pt-2 bg-[var(--fadebg)] flex flex-col">
          {isAdmin && (
            <>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleUploadClick}
                  className="px-8 rounded-2xl bg-[var(--bg)] py-2 text-xl flex items-center gap-4 text-white font-bold"
                >
                  <img src="/images/add.png" alt="ADD" />
                  UPLOAD
                </button>
                <button
                  onClick={handleCalendarClick}
                  className="px-8 rounded-2xl bg-[var(--bg)] py-2 text-xl flex items-center gap-4 text-white font-bold"
                >
                  <FaCalendarAlt />
                  CALENDAR
                </button>
              </div>

              <hr className="border-b-2 mt-2 border-white/30" />
            </>
          )}{" "}
          {showForm && (
            <div className="my-4 mx-10" data-aos="zoom-in">
              <UploadForm onSubmit={handleFormSubmit} />
            </div>
          )}
          {showCalendar && (
            <div
              className="absolute top-[100px] left-[50%] transform -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-[300px]"
              data-aos="zoom-in"
            >
              <div className="flex justify-end">
                <button
                  onClick={handleCalendarClick}
                  className="text-gray-500 hover:text-gray-700 mb-2"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                inline
              />
            </div>
          )}
          <div className="flex-1 overflow-scroll no-scrollbar mt-4 pb-[100px] px-2">
            {events.map((event, index) => (
              <Event key={index} event={event} />
            ))}
            <h1 className="text-center text-4xl text-white mt-8">
              No Post Yet
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;
