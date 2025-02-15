import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { ICouncil } from "../../interface/council";
import { data } from "../../data/councils";
import AOS from "aos";
import "aos/dist/aos.css";

function Council() {
  const { id } = useParams();
  const [council, setCouncile] = useState<ICouncil | undefined>(undefined);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    const getCouncil = data.find((_, i: number) => i + 1 == parseInt(id));

    setCouncile(getCouncil);
  }, [id]);

  return (
    <div className="max-w-[2000px] mx-auto h-screen w-screen min-w-screen min-h-screen">
      <NavBar />

      <div className="h-full w-full  pt-[85px] flex flex-col md:flex-row justify-center gap-8">
        <div
          className="flex flex-col items-center justify-center px-16"
          data-aos="fade-right"
        >
          <img
            src="/images/profile.jpg"
            alt="Profile"
            className="rounded-full max-w-[270px] mi-w-[200px] w-full aspect-square"
          />

          {council && (
            <>
              <h1 className="uppercase text-4xl trend shadow-text text-white mt-16">
                {council.position}
              </h1>
              <p className="text-[var(--pink)] trendOne text-2xl mt-4 uppercase shadow-text-pink">
                {council.name}
              </p>
            </>
          )}
        </div>
        <div
          className="flex-1 h-full  lg:max-w-[750px] grid place-items-center"
          data-aos="fade-left"
        >
          {council && (
            <p className="p-4 md:p-10 lg:p-16 text-white  text-xl uppercase font-bold md:bg-[var(--blue)] rounded-4xl">
              {council.vow}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Council;
