import { useState, useContext, useEffect } from "react";
import NavBar from "../components/NavBar";
import Event from "../components/Event";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";
import AOS from "aos";
import "aos/dist/aos.css";
import UploadFormEvent from "../components/UploadFormEvent";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, set } from "firebase/database";
import { db } from "../../firebase";
import Modal from "../components/Modal";

import { Event as TypeEvent } from "../../data/Event";

function Events() {
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<TypeEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { events, isAdmin } = useContext(DataContext);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 200,
      easing: "ease-in-sine",
      delay: 50,
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = events.filter(
        (event: TypeEvent) =>
          new Date(event.eventDate).toDateString() ===
          selectedDate.toDateString()
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [selectedDate, events]);

  const handleUploadClick = () => {
    setShowForm(!showForm);
  };

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (!data?.content) {
        setError("No content to post");
        return;
      }

      if (!data?.eventDate) {
        setError("Specify Event Date");
        return;
      }

      const urls = [];
      if (data?.media || data.media.length > 0) {
        for (const file of data.media) {
          if (!(file instanceof File)) {
            setError("Invalid file type.");
            return;
          }

          const storageRef = ref(storage, `issco/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          // Determine the media type
          const fileType = file?.name?.split(".")?.pop()?.toLowerCase();

          if (!fileType) {
            setError("Unable to determine the file");
            return;
          }

          const mediaType = ["jpg", "jpeg", "png", "gif"].includes(fileType)
            ? "image"
            : "video";

          urls.push({ url: downloadURL, type: mediaType });
        }
      }

      const newEvents = {
        content: data.content,
        media: urls,
        datePosted: new Date().toISOString(),
        isHighlight: false,
        eventDate: data.eventDate,
      };

      // Save to Realtime Database
      const eventsRef = dbRef(db, "events/" + Date.now());
      await set(eventsRef, newEvents);
      setShowForm(false);
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max">
      <NavBar />
      {error && (
        <Modal type="error" text={error} onClose={() => setError("")} />
      )}
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
              <UploadFormEvent onSubmit={handleFormSubmit} loading={loading} />
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
              <button
                onClick={clearDateFilter}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
              >
                Clear Calendar
              </button>
            </div>
          )}
          <div className="flex-1 overflow-scroll no-scrollbar mt-4 pb-[100px] px-2">
            {filteredEvents.map((event: TypeEvent, index: number) => (
              <Event key={index} event={event} setError={setError} />
            ))}
            {filteredEvents?.length <= 0 && (
              <h1 className="text-center text-4xl text-white mt-8">
                No Events Yet
              </h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;
