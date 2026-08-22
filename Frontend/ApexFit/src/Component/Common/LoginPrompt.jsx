import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

// Popup shown when a guest tries an action that needs an account.
export const LoginPromptModal = ({
  open,
  onClose,
  title = "Login required",
  message = "Please log in to continue.",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <LogIn size={38} className="mx-auto text-red-500" />
        <h3 className="mt-4 text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-6 py-3 font-semibold text-white transition hover:bg-transparent hover:text-black"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-black px-6 py-3 font-semibold transition hover:bg-black hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook pairing the popup with a requireLogin() helper.
// Usage:
//   const { isLoggedIn, requireLogin, loginPrompt } = useLoginGate();
//   if (!isLoggedIn) return requireLogin();   // inside submit handlers
//   {loginPrompt}                              // render next to your JSX
export const useLoginGate = () => {
  const [open, setOpen] = useState(false);
  const requireLogin = () => setOpen(true);
  const loginPrompt = <LoginPromptModal open={open} onClose={() => setOpen(false)} />;
  return {
    isLoggedIn: Boolean(localStorage.getItem("token")),
    requireLogin,
    loginPrompt,
  };
};
