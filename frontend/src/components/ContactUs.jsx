import React from "react";
import { Send } from 'lucide-react';
const ContactUs = () => {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);
    const apiKey = import.meta.env.VITE_FORM_KEY;
    formData.append("access_key", apiKey);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1a2a] p-8 ">
      <div className="max-w-4xl mx-auto space-y-8 mt-60">
        <div 
          className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
          transition-all duration-500 
          hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          hover:border-white/30"
        >
          <h2 className="text-2xl font-semibold mb-8 text-white flex items-center">
            Contact Us
          </h2>
          <form onSubmit={onSubmit} className="space-y-6">
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="Your Name"
              className="w-full bg-white/10 text-white rounded-md px-4 py-3 
                border border-white/20 focus:outline-none focus:border-white/30
                backdrop-blur-lg transition-all duration-300"
            />
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="Your Email"
              className="w-full bg-white/10 text-white rounded-md px-4 py-3 
                border border-white/20 focus:outline-none focus:border-white/30
                backdrop-blur-lg transition-all duration-300"
            />
            <textarea 
              name="message" 
              required 
              placeholder="Your Message"
              className="w-full bg-white/10 text-white rounded-md px-4 py-3 
                border border-white/20 focus:outline-none focus:border-white/30
                backdrop-blur-lg transition-all duration-300"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/20 text-white rounded-md py-3 px-6 
                flex items-center justify-center space-x-2 transition-all duration-300 
                border border-white/20 hover:border-white/30
                hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
                <Send />
              <span>Submit Form</span>
              
            </button>
          </form>
          <span className="text-white mt-4 block">{result}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
