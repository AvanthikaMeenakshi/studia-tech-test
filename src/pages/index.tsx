import Link from "next/link";

/**
 * Landing page — provided for you. No changes needed here.
 *
 * Use this to navigate to the tutor session pages once you've
 * built the [tutorId] page and components.
 */
export default function Home() {
  const tutors = [
    {
      id: "tutor-maths-01",
      name: "Dr Sarah Chen",
      subject: "GCSE Mathematics",
    },
    {
      id: "tutor-english-01",
      name: "James Wright",
      subject: "GCSE English Literature",
    },
    {
      id: "tutor-physics-01",
      name: "Dr Priya Patel",
      subject: "A-Level Physics",
    },
  ];

  return (
    <main className="mx-auto max-w-xl p-8 font-sans">
      <h1 className="text-2xl font-bold text-gray-900">Studia</h1>
      <p className="mt-1 text-gray-500">
        Select a tutor to view and book their sessions:
      </p>

      <ul className="mt-6 list-none p-0 flex flex-col gap-3">
        {tutors.map((tutor) => (
          <li key={tutor.id}>
            <Link
              href={`/sessions/${tutor.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md no-underline"
            >
              <div>
                <p className="font-semibold text-gray-900">{tutor.name}</p>
                <p className="text-sm text-gray-500">{tutor.subject}</p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
