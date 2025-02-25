import { useContext, useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { data } from "../../data/councils";
import { auth } from "../../firebase";
import { DataContext } from "../../context/DataContext";

const Highlight = ({ data }: { data: any }) => {
  // Determine the image URL to use
  const imageUrl =
    data.media?.find((media: any) => media.type.startsWith("image"))?.url ||
    data.assets?.find((asset: any) => asset.type.startsWith("image"))?.url ||
    "/images/headline.jpg";

  return (
    <div className="mt-8 flex flex-wrap " data-aos="zoom-in">
      <div className="group">
        <img
          src={imageUrl}
          alt="Highlight"
          className="max-w-[468px] min-w-[250px] w-full rounded-4xl border-2 border-transparent transition-all duration-200 group-hover:border-[var(--pink)] aspect-[156/109]"
        />
        <p className="text-2xl text-white font-medium my-4 uppercase">
          {data?.type}
        </p>
        <p className="text-4xl text-[var(--pink)] poppins-medium my-4">
          HEADLINE
        </p>
      </div>
    </div>
  );
};

const Council = ({
  i,
  position,
  nav,
}: {
  i: number;
  position: string;
  nav: (i: number) => void;
}) => {
  return (
    <div
      data-aos="zoom-in"
      className="transition-all duration-200 w-full aspect-[114/140] rounded-[100px] overflow-hidden relative z-10 flex flex-col justify-end  items-center max-w-[456px]"
    >
      <img
        src="/images/user.png"
        alt="council"
        className="absolute top-0 left-0 w-full h-full -z-10"
      />
      <p className="text-white text-3xl trendOne  mx-4 mt-8">{position}</p>
      <div
        className="about-button  md:px-8 lg:px-16 px-4 py-4 rounded-full text-xl md:text-2xl mt-5  underline text-white poppins-bold cursor-pointer mb-8 overflow-hidden"
        onClick={() => nav(i + 1)}
      >
        ABOUT THEM
      </div>
    </div>
  );
};

function Home() {
  const [height, setHeight] = useState(0);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { authUser } = useContext(DataContext);
  const { highlights } = useContext(DataContext);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
  }, []);

  useEffect(() => {
    if (aboutUsRef.current) {
      setHeight(aboutUsRef.current.offsetHeight);
    }
  }, [aboutUsRef.current]);

  return (
    <div className="z-0 max">
      <NavBar />

      <div className="home h-[90vh]  pt-[80px] bg-[var(--bg)] relative flex justify-start px-4 lg:px-24">
        <img
          src="/images/abstract.png"
          alt="ASBTRACT"
          className="aspect-square w-full max-w-[600px] absolute center-y right-0 md:right-10 opacity-30 1600:opacity-100"
        />

        <div
          className=" h-full flex-1 max-w-[1100px] flex flex-col justify-center items-start px-8"
          data-aos="fade-right"
        >
          <h1 className="text-5xl md:text-7xl lg:text-9xl trend font-bold text-white shadow-text">
            Welcome
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold trend text-white shadow-text">
            Red Spartan
          </h1>

          <p className="text-xl md:text-3xl lg:text-4xl trendOne font-bold playfair-display shadow-text-pink text-[#ff4ff3] mt-5">
            THROUGH US DEAR {!authUser ? "USER" : authUser?.email}
          </p>
          {!auth?.currentUser && (
            <div className="flex items-center justify-between w-full max-w-[800px] mt-20">
              <button
                className="flex-1   mx-4 py-4  text-xl md:text-2xl lg:text-4xl poppins-bold text-white  cursor-pointer rounded-full about-button"
                onClick={() => navigate("/auth?page=register")}
              >
                SIGN UP
              </button>

              <button
                className="flex-1   mx-4 py-4  text-xl md:text-2xl lg:text-4xl poppins-bold text-white  cursor-pointer rounded-full about-button"
                onClick={() => navigate("/auth")}
              >
                SIGN IN
              </button>
            </div>
          )}
        </div>
      </div>

      {highlights?.length > 0 && (
        <div className="highlights h-auto pb-16 bg-[var(--bg)] px-4 lg:px-24 ">
          <h1
            className="text-4xl md:text-5xl lg:text-8xl bodoni font-extrabold text-white shadow-text mb-16 trend  "
            data-aos="fade-right"
          >
            HIGHLIGHTS
          </h1>
          <div className="flex gap-8 items-center justify-between overflow-x-scroll flex-nowrap w-full no-scrollbar">
            {highlights.map((hl: any, i: number) => (
              <Highlight key={i} data={hl} />
            ))}
          </div>
        </div>
      )}
      <div className="council h-auto pb-16 bg-[var(--bg)] px-4 lg:px-24  pt-20 ">
        <h1 className="text-4xl trend md:text-6xl lg:text-8xl bodoni font-extrabold text-white shadow-text mb-16">
          YOUR COUNCIL
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 py-10 justify-items-center">
          {data.map((dt, i: number) => (
            <Council
              position={dt.position}
              i={i}
              key={i}
              nav={(id: number) => navigate(`/council/${id}`)}
            />
          ))}
        </div>
      </div>

      <div className="about w-full flex  items-center bg-[var(--bg)] px-4 lg:px-24 py-16 gap-8">
        <div className="flex-1" ref={aboutUsRef}>
          <h1
            className="text-4xl md:text-6xl lg:text-8xl bodoni font-extrabold trend text-white shadow-text"
            data-aos="fade-right"
          >
            ABOUT US
          </h1>
          <p
            className="text-2xl text-white poppins-medium my-16 bg-[var(--blue)] rounded-2xl p-10"
            data-aos="fade-up"
          >
            Welcome to the official website for Integrated School students at
            Batangas State University; ISCO HUB! This platform is designed to
            the IS community informed, engaged, and connected. Here, you can
            stay updated with the latest posts from our Student Council members,
            track upcoming events and council timelines, and read insightful
            articles from our talented publishers and writers. Additionally, our
            confession section provides a safe space for students to share
            concerns, seek advice, and express their thoughts anonymously. Our
            goal is to create an open and interactive digital space that
            strengthens student involvement and fosters a supportive community.
          </p>
        </div>
        {height > 0 && (
          <div
            className="flex-1 bg-[url(/images/logo.jpg)] rounded-[20%] hidden 900:block bg-center ml-16"
            data-aos="zoom-out"
            style={{
              height,
            }}
          ></div>
        )}
      </div>

      <div
        className="contact  px-4 lg:px-24 py-16  bg-[var(--bg)]"
        data-aos="fade-right"
      >
        <h1 className="text-4xl md:text-6xl lg:text-8xl bodoni font-extrabold text-white shadow-text mb-16 trend">
          CONTACT US
        </h1>
        <div>
          <p className="text-5xl text-[var(--pink)] poppins-medium my-4">
            PHONE
          </p>
          <p className="text-2xl lg:text-3xl text-white poppins-medium my-4 w-full break-words">
            (123) 456-7890
          </p>
        </div>
        <div className="mt-16">
          <p className="text-5xl text-[var(--pink)] poppins-medium my-4">
            EMAIL
          </p>
          <p className="text-2xl lg:text-3xl text-white poppins-medium my-4 w-full break-words">
            shssc.main1@g.batstate-u.edu.ph
          </p>
        </div>
        <div className="mt-16">
          <p className="text-5xl text-[var(--pink)] poppins-medium my-4">
            Social
          </p>
          <div className="text-3xl text-white poppins-medium my-4 flex items-center flex-wrap gap-4">
            <Link to="/">
              <img
                src="/images/facebook.png"
                alt=""
                className="aspect-square w-[60px]"
              />
            </Link>
            <Link to="/">
              <img
                src="/images/twitter.png"
                alt=""
                className="aspect-square w-[60px]"
              />
            </Link>
            <Link to="/">
              <img
                src="/images/instagram.png"
                alt=""
                className="aspect-square w-[60px]"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
