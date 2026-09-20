import React, { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Mail, MapPin, MessageSquare, Phone, Send, X } from "lucide-react";
import api from "../../../api/axios";
import { createContact } from "../../../api/contact.api";
import EmptyState from "../../Common/EmptyState";
import { useLoginGate } from "../../Common/LoginPrompt";

const INITIAL_FORM = { name: "", email: "", phone: "", message: "" };

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqError, setFaqError] = useState("");
  const { isLoggedIn, requireLogin, loginPrompt } = useLoginGate();

  useEffect(() => {
    // Load FAQ content from the backend instead of hardcoding questions.
    api.get("/faqs")
      .then((response) => setFaqs(response.data?.faqs || []))
      .catch(() => setFaqError("FAQs are temporarily unavailable."));
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setStatus((previous) => ({ ...previous, error: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      await createContact(form);
      setForm(INITIAL_FORM);
      setStatus({ loading: false, error: "" });
      setShowSuccessModal(true);
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.message || "Could not send your message." });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Contact introduction and direct contact details */}
        <section className="rounded-3xl bg-[#27253F] p-8 text-white shadow-xl shadow-red-500/20 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-300">Get in touch</p>
          <h1 className="mt-4 text-4xl font-bold">Let&apos;s talk about your goals.</h1>
          <p className="mt-5 leading-7 text-slate-300">Have a question about training, memberships, or workout plans? Our team is ready to help.</p>
          <div className="mt-10 space-y-5 text-sm text-slate-200">
            <p className="flex items-center gap-3"><MapPin size={20} /> Kathmandu, Nepal</p>
            <a href="tel:+9779749328435" className="flex items-center gap-3 hover:text-white"><Phone size={20} /> +977 9749328435</a>
            <a href="mailto:basantan109@gmail.com" className="flex items-center gap-3 hover:text-white"><Mail size={20} /> basantan109@gmail.com</a>
          </div>
        </section>

        {/* Contact form submitted to the database API */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-red-500/20 sm:p-10">
          <div className="flex items-center gap-3"><MessageSquare className="text-red-500" /><h2 className="text-2xl font-bold text-slate-900">Send us a message</h2></div>
          {status.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{status.error}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#27253F]" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email address" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#27253F]" />
            </div>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone number" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#27253F]" />
            <textarea name="message" value={form.message} onChange={handleChange} required rows="6" placeholder="How can we help?" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#27253F]" />
            <button disabled={status.loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black py-3.5 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black disabled:opacity-60">
              <Send size={18} /> {status.loading ? "Sending..." : "Send message"}
            </button>
          </form>
        </section>
      </div>

      {/* Frequently asked questions loaded from the database API. */}
      <section className="mx-auto mt-10 max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-red-500/20 sm:p-10">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Need to know</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        {faqError && <EmptyState message={faqError} />}
        {!faqError && faqs.length === 0 && <EmptyState message="FAQs will appear here soon." />}
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details key={faq._id} className="group rounded-2xl border border-slate-200 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {faq.question}
                <ChevronDown size={20} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Popup when a guest tries to send a message. */}
      {loginPrompt}

      {/* Confirmation popup after the message is saved successfully. */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="contact-success-title">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl shadow-red-500/30">
            <button type="button" onClick={() => setShowSuccessModal(false)} aria-label="Close confirmation" className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <X size={20} />
            </button>
            <CheckCircle2 className="mx-auto text-green-600" size={58} />
            <h2 id="contact-success-title" className="mt-5 text-2xl font-bold text-slate-900">Message sent successfully</h2>
            <p className="mt-3 text-slate-600">Thank you for contacting ApexFit. Our team will get back to you soon.</p>
            <button type="button" onClick={() => setShowSuccessModal(false)} className="mt-6 rounded-xl border-2 border-black bg-black px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-transparent hover:text-black">
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Contact;
