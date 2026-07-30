import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { EVENTS, track } from "../lib/analytics";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (sending) return;
  setSending(true);

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        message: form.message,
      }),
    });

    const data = await response.json();

    if (data.success) {
      track(EVENTS.CONTACT_SUBMIT, { status: "success" });
      alert("Message sent successfully!");
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } else {
      track(EVENTS.CONTACT_SUBMIT, { status: "rejected" });
      alert("Failed to send message");
    }
  } catch (error) {
    console.error("Error submitting contact form:", error);
    track(EVENTS.CONTACT_SUBMIT, { status: "error" });
    alert("Server error. Please try again later.");
  } finally {
    setSending(false);
  }
};

  return (
    <section
  id="contact"
  className="min-h-screen 
             bg-white dark:bg-black 
             text-black dark:text-white 
             px-6 py-20
             flex flex-col items-center"
>
  
  {/* Content */}
  <div className="w-full max-w-xl text-center">
    <h2 className="text-3xl font-semibold mb-2">Get In Touch</h2>

    <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
      Contact me at{" "}
      <span className="text-black dark:text-white underline underline-offset-4">
        omkargavade002@gmail.com
      </span>{" "}
      or via the form below.
    </p>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      
      {/* Name */}
      <div>
        <label className="block text-xs mb-1 text-gray-700 dark:text-white">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          required
          className="w-full px-4 py-2.5 rounded-lg
                     bg-gray-100 dark:bg-transparent
                     border border-gray-300 dark:border-white/15
                     text-black dark:text-white 
                     placeholder-gray-500
                     focus:outline-none 
                     focus:border-black dark:focus:border-white/40
                     transition"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs mb-1 text-gray-700 dark:text-white">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="hello@gmail.com"
          required
          className="w-full px-4 py-2.5 rounded-lg
                     bg-gray-100 dark:bg-transparent
                     border border-gray-300 dark:border-white/15
                     text-black dark:text-white
                     placeholder-gray-500
                     focus:outline-none 
                     focus:border-black dark:focus:border-white/40
                     transition"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs mb-1 text-gray-700 dark:text-white">
          Message
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Hello! Let's talk..."
          rows={4}
          required
          className="w-full px-4 py-2.5 rounded-lg
                     bg-gray-100 dark:bg-transparent
                     border border-gray-300 dark:border-white/15
                     text-black dark:text-white
                     placeholder-gray-500
                     focus:outline-none 
                     focus:border-black dark:focus:border-white/40
                     transition resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={sending}
          className="px-7 py-2.5 rounded-full
                     bg-black text-white
                     dark:bg-white dark:text-black
                     text-sm font-medium
                     hover:opacity-90
                     active:scale-95
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition"
        >
          {sending ? "Sending…" : "Submit →"}
        </button>
      </div>
    </form>
  </div>

  {/* Footer (always bottom) */}
  <footer className="mt-auto pt-10 text-xs text-gray-500 dark:text-gray-500">
    © {new Date().getFullYear()} Omkar Gavade. All rights reserved.
  </footer>
</section>
  );
}