import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Modal from "../components/Modal";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { ref, set } from "firebase/database";

const Input = ({
  type,
  placeholder,
  value,
  onChange,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <input
      type={type}
      className="w-[90%] my-4 border-2 border-white bg-[var(--gray)] px-4 py-4 rounded-[30px] placeholder:text-white placeholder:text-2xl placeholder:font-bold placeholder:text-center outline-0"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [search] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sucess, setSuccess] = useState("");
  const [readTermsAndConditions, setReadTermsAndConditions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
  }, []);

  useEffect(() => {
    const page = search.get("page");

    if (page && page.toLowerCase() === "register") {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
  }, [search]);

  const handleChangePage = (val: boolean) => {
    setIsSignup(val);
  };

  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  }, [isSignup]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (isSignup) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
    }

    if (isSignup) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (!readTermsAndConditions) {
        setError("Read Terms and Conditions First");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await sendEmailVerification(userCredential.user);

        if (userCredential?.user) {
          // Save user data in Realtime Database
          await set(ref(db, "users/" + userCredential.user.uid), {
            email: email,
            status: "user",
          });
        }

        await signOut(auth);

        // Show success modal
        setSuccess("A verification link has been sent to your email.");
      } catch (error) {
        if (error instanceof Error) {
          // Show error modal
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (!userCredential.user.emailVerified) {
          setError("Please verify your email before signing in.");
          await signOut(auth);
          return;
        }
        navigate("/");
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }
  };

  return (
    <div className="max h-screen md:min-h-screen md:h-auto ">
      <NavBar />
      {error && sucess == "" && (
        <Modal type="error" text={error} onClose={() => setError("")} />
      )}
      {sucess && error == "" && (
        <Modal type="success" text={sucess} onClose={() => setSuccess("")} />
      )}

      <div className="pt-[80px] flex flex-col md:flex-row items-center">
        <div
          className="flex-1 h-full grid place-items-center mt-5"
          data-aos="fade-right"
        >
          <div className="w-full max-w-[700px] border p-8 lg:p-16 linear-gradient-bg lg:rounded-[60px]">
            <h1 className="text-4xl text-white font-bold text-center">
              {isSignup ? "REGISTER FORM" : "LOGIN FORM"}
            </h1>

            <hr className="border-4 w-full border-white my-8" />
            <div className="flex items-center justify-center gap-8">
              <button
                className={`px-8 py-4 cursor-pointer ${
                  isSignup ? "about-button" : "linear-gradient-nav"
                } text-white font-bold text-xl lg:text-2xl rounded-full`}
                onClick={() => handleChangePage(true)}
              >
                SIGN UP
              </button>
              <button
                className={`px-8 py-4 cursor-pointer ${
                  !isSignup ? "about-button" : "linear-gradient-nav"
                } text-white font-bold text-xl lg:text-2xl rounded-full `}
                onClick={() => handleChangePage(false)}
              >
                SIGN IN
              </button>
            </div>

            <form
              className="w-[98%] md:w-[90%] bg-[var(--yellow)] p-4 mx-auto mt-8 rounded-[30px] flex flex-col items-center pt-16 px-8"
              onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                handleSubmit(e)
              }
            >
              {error && <p className="text-red-500">{error}</p>}
              <Input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="ENTER YOUR PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignup && (
                <Input
                  type="password"
                  placeholder="CONFIRM YOUR PASSWORD"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}
              <div className="w-[90%]">
                {isSignup && (
                  <div
                    className="flex items-center gap-2 mt-4 "
                    onClick={() =>
                      setReadTermsAndConditions(!readTermsAndConditions)
                    }
                  >
                    <div
                      className={`w-[20px] aspect-square bg-[var(--gray)] border-2 border-white ${
                        readTermsAndConditions
                          ? "bg-blue-700"
                          : "bg-[var(--gray)]"
                      }`}
                    />
                    <p
                      className="text-white text-md font-bold uppercase"
                      style={{
                        lineHeight: "16px",
                      }}
                    >
                      I have read the terms and conditions
                    </p>
                  </div>
                )}
              </div>

              {isSignup && (
                <p className="text-blue-700 text-2xl">TERMS AND CONDITIONS</p>
              )}

              {!isSignup && (
                <small
                  className="text-blue-700 cursor-pointer"
                  onClick={async () => {
                    if (!email) {
                      setError("Enter your email first");
                      return;
                    }

                    try {
                      await sendPasswordResetEmail(auth, email);

                      setSuccess(
                        "Password reset has been sent through your email"
                      );
                    } catch (error: any) {
                      setError(error?.message);
                    }
                  }}
                >
                  Forgot Password
                </small>
              )}

              <div className="w-full flex justify-end mt-4">
                <button
                  className="linear-gradient-nav px-6 py-2 text-2xl text-white font-bold rounded-[30px]"
                  onClick={(e: React.FormEvent<HTMLButtonElement>) =>
                    handleSubmit(e)
                  }
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex-1 h-full" data-aos="fade-left">
          <div className="w-full h-full p-16">
            <h1 className="text-center text-2xl md:text-3xl lg:text-5xl trend shadow-text text-white">
              sign in or sign up
            </h1>
            <small className="text-center block mt-4 text-[var(--pink)] trendOne shadow-text-pink text-md md:text-xl lg:text-2xl">
              And receive notification
            </small>

            <p className="mt-8 text-md md:text-xl lg:text-2xl text-[var(--pink)] uppercase font-semibold">
              By signing up or signing in ensures a secure and personalized
              experience on our website. By logging in, Student Council members
              can manage posts, update event timelines, and contribute articles,
              while users can interact with content and engage in discussions.
              This system also helps maintain privacy, security, and
              accountability, ensuring that only authorized users have access to
              certain features while keeping the community safe and
              well-regulated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
