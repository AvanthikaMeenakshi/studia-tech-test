import { describe, it, expect } from "vitest";
import { prisma } from "./setup";
import { appRouter } from "../src/server/routers/_app";

// Helper to create a tRPC caller with our test prisma instance
const caller = appRouter.createCaller({ prisma } as any);

// ============================================================
//  TEST SUITE — DO NOT MODIFY
//
//  These tests validate your implementation of the session router.
//  Run with: npm test
// ============================================================

describe("session.getAvailableSessions", () => {
  it("returns only future sessions for the given tutor", async () => {
    const result = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });

    // Should NOT include the past session
    const titles = result.map((s: any) => s.title);
    expect(titles).not.toContain("Past Session: Algebra");

    // Should NOT include sessions for other tutors
    expect(titles).not.toContain("Macbeth Analysis");
  });

  it("excludes fully booked sessions", async () => {
    const result = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });

    // Trigonometry has capacity 1 and 1 confirmed booking — should be excluded
    const titles = result.map((s: any) => s.title);
    expect(titles).not.toContain("Trigonometry");
  });

  it("does not count cancelled bookings towards capacity", async () => {
    const result = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });

    // Quadratics has capacity 5, 1 confirmed + 1 cancelled
    // Should still be available with 4 spots
    const quadratics = result.find(
      (s: any) => s.title === "Quadratic Equations",
    );
    expect(quadratics).toBeDefined();
    expect(quadratics.spotsRemaining).toBe(4);
  });

  it("returns sessions ordered by startsAt ascending", async () => {
    const result = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });

    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].startsAt).getTime();
      const curr = new Date(result[i].startsAt).getTime();
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it("includes tutor name and subject", async () => {
    const result = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });

    expect(result.length).toBeGreaterThan(0);
    const first = result[0];
    expect(first.tutorName).toBe("Dr Sarah Chen");
    expect(first.tutorSubject).toBe("GCSE Mathematics");
  });
});

describe("session.bookSession", () => {
  it("creates a booking for a valid session", async () => {
    const result = await caller.session.bookSession({
      studentId: "student-02",
      sessionId: "session-future-01",
      notes: "Looking forward to it",
    });

    expect(result.status).toBe("confirmed");
    expect(result.sessionId).toBe("session-future-01");
    expect(result.studentId).toBe("student-02");
  });

  it("throws when session does not exist", async () => {
    await expect(
      caller.session.bookSession({
        studentId: "student-01",
        sessionId: "nonexistent-session",
      }),
    ).rejects.toThrow();
  });

  it("throws when session is in the past", async () => {
    await expect(
      caller.session.bookSession({
        studentId: "student-02",
        sessionId: "session-past-01",
      }),
    ).rejects.toThrow();
  });

  it("throws when session is fully booked", async () => {
    // session-future-02 has capacity 1 and 1 confirmed booking
    await expect(
      caller.session.bookSession({
        studentId: "student-01",
        sessionId: "session-future-02",
      }),
    ).rejects.toThrow();
  });

  it("throws when student already has a confirmed booking", async () => {
    // student-01 already has a confirmed booking for session-future-01
    await expect(
      caller.session.bookSession({
        studentId: "student-01",
        sessionId: "session-future-01",
      }),
    ).rejects.toThrow();
  });

  it("allows re-booking after cancellation", async () => {
    // student-03 has a cancelled booking for session-future-01
    const result = await caller.session.bookSession({
      studentId: "student-03",
      sessionId: "session-future-01",
    });

    expect(result.status).toBe("confirmed");
    expect(result.studentId).toBe("student-03");
  });
});

describe("session.cancelBooking", () => {
  it("cancels a confirmed booking", async () => {
    const result = await caller.session.cancelBooking({
      bookingId: "booking-confirmed-01",
    });

    expect(result.status).toBe("cancelled");
    expect(result.id).toBe("booking-confirmed-01");
  });

  it("throws when booking does not exist", async () => {
    await expect(
      caller.session.cancelBooking({
        bookingId: "nonexistent-booking",
      }),
    ).rejects.toThrow();
  });

  it("throws when booking is already cancelled", async () => {
    await expect(
      caller.session.cancelBooking({
        bookingId: "booking-cancelled-01",
      }),
    ).rejects.toThrow();
  });

  it("frees up capacity after cancellation", async () => {
    // Cancel the booking that fills session-future-02
    await caller.session.cancelBooking({ bookingId: "booking-full-01" });

    // Now session-future-02 should appear in available sessions
    const available = await caller.session.getAvailableSessions({
      tutorId: "tutor-maths-01",
    });
    const trig = available.find((s: any) => s.title === "Trigonometry");
    expect(trig).toBeDefined();
    expect(trig.spotsRemaining).toBe(1);
  });
});

describe("session.getStudentBookings", () => {
  it("returns all bookings for a student", async () => {
    const result = await caller.session.getStudentBookings({
      studentId: "student-01",
    });

    expect(result.length).toBe(1);
    expect(result[0].status).toBe("confirmed");
  });

  it("includes session and tutor details", async () => {
    const result = await caller.session.getStudentBookings({
      studentId: "student-01",
    });

    const booking = result[0];
    expect(booking.session).toBeDefined();
    expect(booking.session.title).toBe("Quadratic Equations");
    expect(booking.tutorName).toBeDefined();
    expect(booking.tutorName).toBe("Dr Sarah Chen");
  });

  it("filters by status when provided", async () => {
    const confirmed = await caller.session.getStudentBookings({
      studentId: "student-03",
      status: "confirmed",
    });
    expect(confirmed.length).toBe(0);

    const cancelled = await caller.session.getStudentBookings({
      studentId: "student-03",
      status: "cancelled",
    });
    expect(cancelled.length).toBe(1);
    expect(cancelled[0].status).toBe("cancelled");
  });

  it("returns bookings ordered by session startsAt descending", async () => {
    // Give student-01 a second booking so we can test ordering
    await prisma.booking.create({
      data: {
        studentId: "student-01",
        sessionId: "session-future-03",
        status: "confirmed",
      },
    });

    const result = await caller.session.getStudentBookings({
      studentId: "student-01",
    });

    expect(result.length).toBe(2);
    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].session.startsAt).getTime();
      const curr = new Date(result[i].session.startsAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
