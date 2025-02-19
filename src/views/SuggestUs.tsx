import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import NavBar from "../components/NavBar";
import emailjs from "emailjs-com";
import { configSuggest } from "../../utilities/emailjs";
import AOS from "aos";
import "aos/dist/aos.css";

function SuggestUs() {
  const [contactEmail, setContactEmail] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [errors, setErrors] = useState<{
    contactEmail: string;
    suggestions: string;
  }>({ contactEmail: "", suggestions: "" });

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
  }, []);

  const handleContactEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContactEmail(e.target.value);
  };

  const handleSuggestionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSuggestions(e.target.value);
  };

  const validateInputs = () => {
    let tempErrors = { contactEmail: "", suggestions: "" };
    let isValid = true;

    if (contactEmail && !/\S+@\S+\.\S+/.test(contactEmail)) {
      tempErrors.contactEmail = "Invalid email format.";
      isValid = false;
    }

    if (!suggestions) {
      tempErrors.suggestions = "Suggestions field cannot be empty.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateInputs()) {
      // Save input data
      console.log({ contactEmail, suggestions });
      // Reset fields after successful save
      setContactEmail("");
      setSuggestions("");
      setErrors({ contactEmail: "", suggestions: "" });

      const templateParams = {
        from_email: contactEmail === "" ? "Anonyouus" : contactEmail,
        message: suggestions,
      };

      await emailjs.send(
        configSuggest[0],
        configSuggest[1],

        templateParams,
        configSuggest[2]
      );
      alert("Your suggestions have been submitted.");
    }
  };

  return (
    <div className="max mx-auto h-screen overflow-scroll no-scrollbar">
      <NavBar />

      <div className="h-full pt-[80px] w-full max grid place-items-center mx-auto ">
        <div className="w-full max-w-[800px] p-8 bg-white rounded-2xl">
          <h1 className="text-4xl font-bold" data-aos="slide-left">
            Suggestions
          </h1>

          <form onSubmit={handleSubmit} data-aos="fade-right">
            <input
              type="text"
              placeholder="Email (Optional)"
              value={contactEmail}
              onChange={handleContactEmailChange}
              className="w-full py-3 px-6 my-4 text-xl border-3 border-blue-500 focus:outline-0 focus:border-blue-900 rounded-sm"
              data-aos="slide-right"
            />
            {errors.contactEmail && (
              <span className="text-red-500">{errors.contactEmail}</span>
            )}

            <textarea
              placeholder="Suggestions"
              value={suggestions}
              onChange={handleSuggestionsChange}
              className="w-full py-3 px-6 my-4 border-3 border-blue-500 focus:outline-0 focus:border-blue-900 rounded-sm resize-none h-[400px] text-xl"
              data-aos="slide-right"
            />
            {errors.suggestions && (
              <span className="text-red-500">{errors.suggestions}</span>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 my-4 text-xl bg-blue-500 text-white rounded-sm hover:bg-blue-900 "
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SuggestUs;
