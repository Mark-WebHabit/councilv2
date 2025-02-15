import React from "react";
import { IconType } from "react-icons";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

interface ModalProps {
  type: "success" | "error";
  text: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ type, text, onClose }) => {
  const Icon: IconType =
    type === "success" ? AiOutlineCheckCircle : AiOutlineCloseCircle;
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-96">
        <Icon className={`w-12 h-12 animate-bounce ${iconColor}`} />
        <span className="text-lg text-center">{text}</span>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
