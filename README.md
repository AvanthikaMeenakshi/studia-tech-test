## Approach

I started with the backend tRPC procedures to ensure all business rules and edge cases were handled correctly. I used the tests to guide correctness, but there were a few areas where I had to make decisions, especially around booking concurrency, re-booking behaviour, and ensuring cancelled bookings didn’t affect capacity.

Once the API layer was stable, I implemented the frontend components, focusing on clear state handling (loading, booking, error) and keeping components small and reusable.

## Improvements

If this were a production system, I would:

- Move capacity enforcement to a stricter DB-level guarantee (e.g. row-level locking or optimistic concurrency)
- Consider queueing or retry strategies for high contention scenarios
- Separate read/write models (CQRS-style) for better scalability
- Add pagination and filtering to session queries
- Add structured logging around booking attempts and failures
- Track metrics such as booking success rate and contention
- Add integration tests for concurrent booking scenarios
- Encapsulate booking rules into a service layer instead of inline logic

## UI improvements

- If the request resolves too quickly, the loading state flashes and feels like a flicker. I’d enforce a minimum loading duration and add a spinner to avoid layout shift.
- Extend test coverage with React Testing Library for component states, and Cypress e2e tests covering the full book flow
- Introduce clearer domain types (e.g. BookingStatus enum shared across layers)
- Surface session availability (e.g. “3 spots left”) at the tutor list level to help users make quicker decisions and reduce unnecessary navigation
- Show a success state (e.g. “Booked ✓”) via toast notifications
- Would make the time UX better: Format times relative to the user (e.g. “Today at 3:00 PM”, “Tomorrow”) to improve readability and highlight upcoming sessions (e.g. within next 24 hours)

## Future Direction

Given scale (e.g. thousands of concurrent bookings), I would evolve this into an event-driven system:

- Booking requests handled via API → published to a queue
- Worker processes bookings sequentially per session
- Ensures strict capacity guarantees without heavy DB contention
