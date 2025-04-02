import React, { useState } from "react";
import { Send, Mail, User, MessageSquare, Phone, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from "framer-motion";
import { toast } from "sonner";

const ContactUs = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(event.target);
      const apiKey = import.meta.env.VITE_FORM_KEY;
      formData.append("access_key", apiKey);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormState({
          name: "",
          email: "",
          message: ""
        });
        toast.success("Message sent successfully!");
      } else {
        console.log("Error", data);
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 pt-8 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about our platform? Interested in collaboration? Reach out to our team and we'll get back to you soon.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <motion.div 
            className="bg-card/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-border/50"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
              <h2 className="text-white text-xl font-semibold">Send us a message</h2>
              <p className="text-white/80 text-sm">We'd love to hear from you</p>
            </div>
            
            {isSubmitted ? (
              <motion.div 
                className="p-8 flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for reaching out to us. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    <span>Your Name</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required 
                    placeholder="John Doe"
                    className="w-full bg-background/50 rounded-lg px-4 py-3 
                      border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                      transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    <span>Email Address</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formState.email}
                    onChange={handleChange}
                    required 
                    placeholder="your.email@example.com"
                    className="w-full bg-background/50 rounded-lg px-4 py-3 
                      border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                      transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-500" />
                    <span>Message</span>
                  </label>
                  <textarea 
                    name="message" 
                    value={formState.message}
                    onChange={handleChange}
                    required 
                    placeholder="How can we help you?"
                    rows={5}
                    className="w-full bg-background/50 rounded-lg px-4 py-3 
                      border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                      transition-all duration-200 resize-none"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                    text-white font-medium rounded-lg py-3 px-6 
                    flex items-center justify-center gap-2 transition-all duration-300 
                    shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
          
          {/* Contact Information */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-md">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-2 mt-1">
                    <Mail className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-muted-foreground">support@horizonplatform.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 mt-1">
                    <Phone className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-fuchsia-100 rounded-full p-2 mt-1">
                    <MapPin className="text-fuchsia-600" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Office</h4>
                    <p className="text-muted-foreground">123 Innovation Dr, Tech City, CA 94103</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <Clock className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium">Hours</h4>
                    <p className="text-muted-foreground">Monday - Friday: 9AM - 6PM PST</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card/70 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-md">
              <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  {
                    q: "Is Horizon Platform free to use?",
                    a: "Yes, the core features of Horizon are free. Premium features require a subscription."
                  },
                  {
                    q: "How accurate are the AI career predictions?",
                    a: "Our AI predictions are based on industry data and are continuously improving with user feedback."
                  },
                  {
                    q: "Can I export my portfolio?",
                    a: "Yes, you can download your portfolio in PDF format or share it via a custom link."
                  }
                ].map((faq, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="bg-background/50 rounded-lg p-4 border border-border/50"
                  >
                    <h4 className="font-medium mb-2">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
