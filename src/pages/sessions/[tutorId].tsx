import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "~/utils/trpc";
import SessionCard from "~/components/SessionCard";

/**
 * ============================================================
 *  TUTOR SESSIONS PAGE — YOUR TASK
 * ============================================================
 *
 *  Build a page that displays a tutor's available sessions
 *  and allows a student to book them.
 *
 *  Requirements:
 *    - Use the tRPC hook to fetch available sessions for the tutor
 *    - Display sessions using your SessionCard component
 *    - Implement booking via the bookSession mutation
 *    - Show appropriate loading and error states
 *    - After a successful booking, refresh the sessions list
 *    - For simplicity, hardcode the studentId as "student-01"
 *
 *  Hints:
 *    - The tutorId comes from the URL: /sessions/[tutorId]
 *    - Use `trpc.session.getAvailableSessions.useQuery()`
 *    - Use `trpc.session.bookSession.useMutation()`
 *    - Consider what happens to the UI during and after booking
 *
 *  We're NOT judging visual design here. Clean, functional React
 *  with proper TypeScript and state management is what we're after.
 * ============================================================
 */

const STUDENT_ID = "student-01";

export default function TutorSessionsPage() {
  const router = useRouter();
  const tutorId = router.query.tutorId as string;

  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>(
    {},
  );

  const {
    data: sessions,
    isLoading,
    isError,
    refetch,
  } = trpc.session.getAvailableSessions.useQuery(
    { tutorId },
    { enabled: !!tutorId },
  );

  const { mutate: bookSession } = trpc.session.bookSession.useMutation({
    onSuccess: (_, variables) => {
      setBookingErrors((prev) => {
        const next = { ...prev };
        delete next[variables.sessionId];
        return next;
      });
      void refetch();
    },
    onError: (error, variables) => {
      setBookingErrors((prev) => ({
        ...prev,
        [variables.sessionId]: error.message,
      }));
    },
    onSettled: () => {
      setBookingSessionId(null);
    },
  });

  function handleBook(sessionId: string) {
    setBookingSessionId(sessionId);
    bookSession({ sessionId, studentId: STUDENT_ID });
  }

  if (isLoading) {
    return (
      <PageShell>
        <p className="text-gray-500">Loading sessions...</p>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell>
        <p className="text-red-500">
          Failed to load sessions. Please try again.
        </p>
      </PageShell>
    );
  }

  if (!sessions?.length) {
    return (
      <PageShell>
        <p className="text-gray-500">No available sessions.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ul className="flex flex-col gap-3">
        {sessions.map((session) => (
          <li key={session.id}>
            <SessionCard
              title={session.tutor.subject}
              startsAt={new Date(session.startsAt)}
              endsAt={new Date(session.endsAt)}
              remainingSpots={session.spotsRemaining}
              isBooking={bookingSessionId === session.id}
              onBook={() => handleBook(session.id)}
            />
            {bookingErrors[session.id] && (
              <p className="mt-2 rounded bg-red-100 p-3 text-sm text-red-700">
                {bookingErrors[session.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl p-8 font-sans">
      <h1 className="mb-6 text-xl font-bold text-gray-900">
        Available Sessions
      </h1>
      {children}
    </main>
  );
}
