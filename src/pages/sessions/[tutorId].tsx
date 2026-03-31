import { useRouter } from "next/router";

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

export default function TutorSessionsPage() {
  const router = useRouter();
  const tutorId = router.query.tutorId as string;

  // TODO: Implement this page

  return (
    <main className="max-w-xl mx-auto p-8 font-sans">
      <h1>Tutor Sessions</h1>
      <p>TODO: Fetch and display available sessions for tutor {tutorId}</p>
    </main>
  );
}
