import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

const Button = ({ path, text }: { path: string; text: string }) => {
  return (
    <Link
      to={path}
      className=" px-4 md md:px-0 md:min-w-[130px] lg:min-w-[140px] text-nowrap py-2  rounded-full border border-white text-center text-md text-white poppins-semibold"
    >
      {text}
    </Link>
  );
};
function NavBar() {
  const navigatie = useNavigate();
  return (
    <div className="fixed h-[80px] w-screen linear-gradient-nav flex items-center justify-between px-4 gap-4 overflow-x-scroll no-scrollbar z-100 max">
      <Link to={"/"}>
        <div className="logo flex items-center gap-2">
          <img
            src="/images/logo.jpg"
            alt="Logo"
            className="w-[52px] aspect-square rounded-full"
          />
          <p className="poppins-bold text-white md:text-xl lg:text-3xl hidden 900:block ">
            ISSCO HUB
          </p>
        </div>
      </Link>

      <div className="flex-1 flex justify-end items-center gap-4 mr-8">
        <Button text="POSTS" path="/posts" />
        <Button text="EVENTS" path="/events" />
        <Button text="ARTICLES" path="/" />
        <Button text="COFESSIONS" path="/" />
        <Button text="SUGGEST US" path="/" />
        {auth?.currentUser && (
          <button
            className="px-4 md md:px-0 md:min-w-[130px] lg:min-w-[140px] text-nowrap py-2  rounded-full border border-white text-center text-md text-white poppins-semibold"
            onClick={() => {
              auth.signOut();
              navigatie("/");
            }}
          >
            LOGOUT
          </button>
        )}
      </div>
    </div>
  );
}

export default NavBar;
