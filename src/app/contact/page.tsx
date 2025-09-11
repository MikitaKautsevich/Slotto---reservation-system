'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Button from '@/components/ui/Button';

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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-5xl font-bold text-center mb-12">Get in Touch</h1>
      <p className="text-center text-gray-500 mb-16 text-lg">
        Have any questions or inquiries? Reach out to us through the form or via our contact info.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left side: Contact Info */}
        <div className="space-y-8">
          <div className="p-6 border rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 flex items-start">
            <FiMail/>
            <div>
              <h3 className="text-xl font-semibold mb-1">Email</h3>
              <p className="text-gray-700">contact@awesomecompany.com</p>
            </div>
          </div>

          <div className="p-6 border rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 flex items-start">
            <FiPhone />
            <div>
              <h3 className="text-xl font-semibold mb-1">Phone</h3>
              <p className="text-gray-700">+1 234 567 890</p>
            </div>
          </div>

          <div className="p-6 border rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 flex items-start">
            <FiMapPin />
            <div>
              <h3 className="text-xl font-semibold mb-1">Location</h3>
              <p className="text-gray-700">123 Main Street, City, Country</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="250"
              className="border-0"
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Right side: Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              className="w-full border rounded-xl p-4 h-40 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition transform hover:scale-105"
            >
              Send Message
            </Button>
            {success && <p className="text-green-600 mt-2">Your message has been sent!</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
