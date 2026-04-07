import React from "react";

/**
 * ============================================================
 *  SESSION CARD COMPONENT — YOUR TASK
 * ============================================================
 *
 *  Build a card component that displays a single tutoring session.
 *
 *  Props (define the TypeScript interface yourself):
 *    - Session title
 *    - Start and end times (formatted for display)
 *    - Number of remaining spots
 *    - Whether the session is bookable
 *    - An onBook callback
 *
 *  Requirements:
 *    - Display the session title, date/time, and spots remaining
 *    - Show a "Book" button that calls onBook when clicked
 *    - Disable the button and show "Full" when no spots remain
 *    - Show a loading/disabled state while a booking is in progress
 *    - Tailwind CSS is available for styling
 *
 *  This component is deliberately open-ended. We care about:
 *    - Clean TypeScript (proper typing of props)
 *    - Logical component structure
 *    - Handling of states (available, full, booking in progress)
 *    - Readable, maintainable code
 * ============================================================
 */

// TODO: Define your props interface and implement the component
interface SessionCardProps {
  title: string;
  startsAt: Date;
  endsAt: Date;
  remainingSpots: number;
  isBooking: boolean;
  onBook: () => void;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SessionCard({
  title,
  startsAt,
  endsAt,
  remainingSpots,
  isBooking,
  onBook,
}: SessionCardProps) {
  const isFull = remainingSpots === 0;
  const isDisabled = isFull || isBooking;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>

      <div className="mt-1 text-sm text-gray-500">
        {formatDateTime(startsAt)} — {formatDateTime(endsAt)}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-sm font-medium ${
            isFull ? "text-red-500" : "text-green-600"
          }`}
        >
          {isFull
            ? "Full"
            : `${remainingSpots} spot${remainingSpots !== 1 ? "s" : ""} left`}
        </span>

        <button
          onClick={onBook}
          disabled={isDisabled}
          className="min-w-[100px] rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBooking ? "Booking..." : isFull ? "Full" : "Book"}
        </button>
      </div>
    </div>
  );
}
