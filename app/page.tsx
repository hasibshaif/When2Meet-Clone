// pages/index.tsx
import Head from 'next/head';
import Header from '@/components/Header';
import MeetingForm from '@/components/MeetingForm';
import AvailabilityGrid from '@/components/AvailabilityGrid';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>When2Meet Clone</title>
        <meta name="description" content="A modern, mobile-friendly scheduling app" />
      </Head>
      <main className="min-h-screen flex flex-col items-center bg-gray-100">
        <Header />
        <div className="w-full max-w-3xl p-4">
          <MeetingForm />
          <AvailabilityGrid />
        </div>
      </main>
    </>
  );
}
