import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';

export default function NotFound() {
  return (
    <div className="flex min-h-[90svh] flex-col items-center justify-center px-5 text-center">
      <div className="w-16">
        <Mark sizes="64px" />
      </div>
      <p className="label mt-10 text-mist">404</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">Off the path.</h1>
      <p className="mt-4 text-sm text-mist">This page doesn’t exist. The discipline does.</p>
      <Link href="/" className="btn-solid mt-10">
        Back to NATYSIMO
      </Link>
    </div>
  );
}
