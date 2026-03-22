import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Laundry App</h1>

      <Link href="/book">
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Book Service
        </button>
      </Link>
    </div>
  );
}