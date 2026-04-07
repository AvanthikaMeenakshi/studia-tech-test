import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * ============================================================
 *  SESSION ROUTER — YOUR TASK
 * ============================================================
 *
 *  Implement the four tRPC procedures below. Each procedure has:
 *    - A description of what it should do
 *    - The expected input schema (already defined)
 *    - Hints about edge cases to handle
 *
 *  The Prisma client is available via `ctx.prisma`.
 *  Refer to prisma/schema.prisma for the data model.
 *
 *  Run `npm test` to check your progress — all tests should pass.
 * ============================================================
 */

export const sessionRouter = router({
  /**
   * PROCEDURE 1: getAvailableSessions
   *
   * Return a tutor's FUTURE sessions that still have available capacity.
   *
   * Requirements:
   *   - Only return sessions where startsAt is in the future
   *   - Only return sessions that are NOT fully booked
   *   - A session's booked count should only include "confirmed" bookings
   *     (cancelled bookings do NOT count towards capacity)
   *   - Include the tutor's name and subject in the response
   *   - Include how many spots remain for each session
   *   - Order results by startsAt ascending (soonest first)
   */
  getAvailableSessions: publicProcedure
    .input(
      z.object({
        tutorId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const { tutorId } = input;
      const sessions = await ctx.prisma.session.findMany({
        where: {
          tutorId,
          startsAt: {
            gt: now,
          },
        },
        include: {
          tutor: {
            select: {
              name: true,
              subject: true,
            },
          },
          bookings: {
            where: {
              status: "confirmed",
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      });
      return sessions
        .map((session) => {
          const confirmedCount = session.bookings.length;
          const spotsRemaining = session.capacity - confirmedCount;
          return {
            ...session,
            spotsRemaining,
            tutorName: session.tutor.name,
            tutorSubject: session.tutor.subject,
          };
        })
        .filter((session) => session.spotsRemaining > 0);
    }),

  /**
   * PROCEDURE 2: bookSession
   *
   * Book a student into a session.
   *
   * Requirements:
   *   - Validate the session exists and is in the future
   *   - Validate the session is not fully booked (confirmed bookings only)
   *   - Prevent duplicate bookings (same student + same session)
   *     BUT: if the student previously cancelled, allow them to re-book
   *   - Return the created booking with session details
   *
   * Error handling — throw descriptive errors for:
   *   - Session not found
   *   - Session is in the past
   *   - Session is fully booked
   *   - Student already has a confirmed booking for this session
   */
  bookSession: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        sessionId: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const { studentId, sessionId, notes } = input;
      const session = await ctx.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          bookings: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }
      if (new Date(session.startsAt) < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Session is in the past",
        });
      }
      const confirmedBooking = session.bookings.find(
        (b) => b.studentId === studentId && b.status === "confirmed",
      );
      if (confirmedBooking) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Student already has a confirmed booking for this session",
        });
      }
      const booking = await ctx.prisma.$transaction(async (tx) => {
        const confirmedCount = await tx.booking.count({
          where: { sessionId, status: "confirmed" },
        });

        if (session.capacity - confirmedCount <= 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Session is fully booked",
          });
        }

        return tx.booking.upsert({
          where: {
            studentId_sessionId: {
              studentId,
              sessionId,
            },
          },
          update: {
            status: "confirmed",
            notes,
          },
          create: {
            ...input,
            status: "confirmed",
          },
          include: {
            session: { include: { tutor: true } },
          },
        });
      });

      return booking;
    }),

  /**
   * PROCEDURE 3: cancelBooking
   *
   * Cancel an existing booking.
   *
   * Requirements:
   *   - Find the booking by ID
   *   - Only allow cancellation if the booking status is "confirmed"
   *   - Only allow cancellation if the session hasn't started yet
   *   - Set the booking status to "cancelled" (do NOT delete it)
   *   - Return the updated booking
   *
   * Error handling — throw descriptive errors for:
   *   - Booking not found
   *   - Booking is already cancelled
   *   - Session has already started or passed
   */
  cancelBooking: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const { bookingId } = input;
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          session: {
            select: {
              id: true,
              startsAt: true,
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      if (booking.status === "cancelled") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Booking is already cancelled",
        });
      }
      if (booking.session.startsAt <= now) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Session has already started or passed",
        });
      }
      const updatedBooking = await ctx.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
        include: {
          session: { include: { tutor: true } },
        },
      });
      return updatedBooking;
    }),

  /**
   * PROCEDURE 4: getStudentBookings
   *
   * Return all bookings for a given student.
   *
   * Requirements:
   *   - Include session details (title, startsAt, endsAt) and tutor name
   *   - Include the booking status
   *   - Order by session startsAt descending (most recent first)
   *   - Optionally filter by status if provided
   */
  getStudentBookings: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(["confirmed", "cancelled"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { studentId, status } = input;
      const bookings = await ctx.prisma.booking.findMany({
        where: { studentId, status },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          session: {
            include: {
              tutor: {
                select: {
                  name: true,
                  subject: true,
                },
              },
            },
          },
        },
      });
      return bookings.map((booking) => {
        return {
          ...booking,
          tutorName: booking.session.tutor.name,
          tutorSubject: booking.session.tutor.subject,
        };
      });
    }),
});
