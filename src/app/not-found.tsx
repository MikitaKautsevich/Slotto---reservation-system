'use client';

import Link from 'next/link';
import Button from '@/components/custom/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Page not found
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Sorry, we couldn’t find the page you’re looking for. It might have been removed or temporarily unavailable.
      </p>

      <Link href="/" passHref>
        <Button className="gap-2">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
