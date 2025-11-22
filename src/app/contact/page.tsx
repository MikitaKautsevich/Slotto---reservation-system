'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Button from '@/components/custom/Button';
import Input from '@/components/custom/Input';
import Textarea from '@/components/custom/Textarea';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      console.log('Message sent:', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black/5 overflow-hidden">

      {/* Neon blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-12 relative z-10">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Get in Touch
          </h1>
          <p className="text-white/60 text-lg">
            Have questions or inquiries? Reach out to us using the form or the information below.
          </p>

          {[
            { icon: <FiMail size={24} />, title: 'Email', info: 'contact@awesomecompany.com' },
            { icon: <FiPhone size={24} />, title: 'Phone', info: '+1 234 567 890' },
            { icon: <FiMapPin size={24} />, title: 'Location', info: '123 Main Street, City, Country' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <div className="text-blue-400">{item.icon}</div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-white/60">{item.info}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />
            <Input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />
            <Input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-purple-500"
            />
            <Textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl p-4 h-44 focus:ring-purple-500 outline-none transition"
            />
            <Button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 hover:scale-[1.02] transition"
            >
              Send Message
            </Button>

            {success && <p className="text-green-400 mt-2 text-center font-medium">Your message has been sent!</p>}
            {error && <p className="text-red-400 mt-2 text-center font-medium">{error}</p>}
          </form>
        </div>

      </div>
    </div>
  );
}
