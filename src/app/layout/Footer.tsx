'use client';

import Link from 'next/link';
import { FaInstagram, FaLinkedinIn, FaTwitter, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  const brand = {
    initials: 'ST',
    name: 'Slotto',
    description:
      'Book, manage, and track your reservations seamlessly — anytime, anywhere.',
  };

  const sections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Help Center', href: '/help' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'Careers', href: '/careers' },
        { name: 'Partners', href: '/partners' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
    },
  ];

  const socials = [
    { icon: <FaInstagram />, href: '#' },
    { icon: <FaLinkedinIn />, href: '#' },
    { icon: <FaTwitter />, href: '#' },
    { icon: <FaTiktok />, href: '#' },
  ];

  return (
    <footer className="mt-20 bg-[#030617] text-white py-14 px-6 rounded-t-3xl border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="flex flex-col">

          {/* LOGO + NAME (EXACTLY LIKE HEADER) */}
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold text-lg shadow-md transition-transform hover:scale-110">
              ST
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-bold text-2xl tracking-wide">
              Slotto
            </span>
          </Link>

          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {brand.description}
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-5 text-xl">
            {socials.map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                className="text-white/70 hover:text-white transition-colors duration-200 hover:scale-110"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-lg mb-4 text-white">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Line */}
      <div className="border-t border-white/10 mt-14 pt-6 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
