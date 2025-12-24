'use client';

import Link from 'next/link';
import Button from '@/components/custom/Button';


export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 px-6 text-center">
      <h1 className="text-9xl font-extrabold text-purple-700 mb-4 animate-bounce">
        404
      </h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">
        Oops! Page not found
      </h2>
      <p className="text-gray-600 mb-8 max-w-lg">
        Looks like this page is already booked 😅. Check the URL or go back to the homepage to continue your reservation.
      </p>

      <Link href="/" passHref>
        <Button className="bg-purple-600 text-white hover:bg-purple-700 gap-2">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
