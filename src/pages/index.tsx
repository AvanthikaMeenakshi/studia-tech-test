import Link from "next/link";

/**
 * Landing page — provided for you. No changes needed here.
 *
 * Use this to navigate to the tutor session pages once you've
 * built the [tutorId] page and components.
 */
export default function Home() {
  const tutors = [
    { id: "tutor-maths-01", name: "Dr Sarah Chen", subject: "GCSE Mathematics" },
    { id: "tutor-english-01", name: "James Wright", subject: "GCSE English Literature" },
    { id: "tutor-physics-01", name: "Dr Priya Patel", subject: "A-Level Physics" },
  ];

  return (
    <main className="max-w-xl mx-auto p-8 font-sans">
      <h1>Studia Tech Test</h1>
      <p>Select a tutor to view and book their sessions:</p>
      <ul className="list-none p-0">
        {tutors.map((tutor) => (
          <li key={tutor.id} className="mb-4">
            <Link
              href={`/sessions/${tutor.id}`}
              className="block p-4 border border-gray-300 rounded-lg no-underline text-inherit"
            >
              <strong>{tutor.name}</strong>
              <br />
              <span className="text-gray-500">{tutor.subject}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
