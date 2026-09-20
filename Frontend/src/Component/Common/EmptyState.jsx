import React from "react";
import errorImage from "../../assets/images/error.jpg";

// Shared empty and error state with the project error illustration.
const EmptyState = ({ message = "No data found." }) => (
  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
    <img
      src={errorImage}
      alt="No content available"
      className="h-44 w-auto max-w-full object-contain"
    />
    <p className="mt-5 max-w-md text-base font-semibold text-slate-600">{message}</p>
  </div>
);

export default EmptyState;
