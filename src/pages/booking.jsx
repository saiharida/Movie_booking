import React, { useEffect, useState } from "react";
import "./booking.css";

// Point this at your actual backend URL / proxy
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

function Booking({ showId }) {
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch show details + already-booked seats on mount
  useEffect(() => {
    async function fetchSeats() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/shows/${showId}/seats`);
        if (!res.ok) throw new Error("Could not load seat data");
        const data = await res.json();
        setShow(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (showId) {
      fetchSeats();
    } else {
      setError("No showId provided to Booking component.");
      setLoading(false);
    }
  }, [showId]);

  function toggleSeat(seatNo) {
    if (show.bookedSeats.includes(seatNo)) return; // can't select booked seats

    setSelectedSeats((prev) =>
      prev.includes(seatNo)
        ? prev.filter((s) => s !== seatNo)
        : [...prev, seatNo]
    );
  }

  async function handleProceedToPayment() {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // adjust to however your auth stores the JWT

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showId, seats: selectedSeats }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Someone else booked one of these seats first — refresh seat map
        setError(
          `Seats ${data.conflictingSeats.join(", ")} were just taken. Please pick different seats.`
        );
        setShow((prev) => ({
          ...prev,
          bookedSeats: [...prev.bookedSeats, ...data.conflictingSeats],
        }));
        setSelectedSeats((prev) =>
          prev.filter((s) => !data.conflictingSeats.includes(s))
        );
        return;
      }

      if (!res.ok) {
        setError(data.message || "Booking failed");
        return;
      }

      setBookingResult(data.booking);
      setSelectedSeats([]);
    } catch (err) {
      setError("Something went wrong while booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="booking-page">Loading seats...</div>;
  if (!show) return <div className="booking-page">{error || "Show not found."}</div>;

  const totalAmount = selectedSeats.length * show.pricePerSeat;

  return (
    <div className="booking-page">
      {/* Movie Details */}
      <div className="movie-info">
        <h1>Book Your Tickets</h1>
        <div className="details">
          <p><strong>Movie:</strong> {show.movieTitle}</p>
          <p><strong>Theatre:</strong> {show.theatre}</p>
          <p><strong>Date:</strong> {show.date}</p>
          <p><strong>Show Time:</strong> {show.time}</p>
        </div>
      </div>

      {/* Screen */}
      <div className="screen-section">
        <div className="screen-line"></div>
        <p>SCREEN</p>
      </div>

      {/* Seat Layout */}
      <div className="seat-layout">
        {show.rows.map((row) => (
          <div className="seat-row" key={row}>
            {Array.from({ length: show.seatsPerRow }, (_, index) => {
              const seatNo = `${row}${index + 1}`;
              const isBooked = show.bookedSeats.includes(seatNo);
              const isSelected = selectedSeats.includes(seatNo);

              return (
                <button
                  key={seatNo}
                  className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                  disabled={isBooked}
                  onClick={() => toggleSeat(seatNo)}
                >
                  {seatNo}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span className="box available"></span>
          Available
        </div>
        <div className="legend-item">
          <span className="box selected"></span>
          Selected
        </div>
        <div className="legend-item">
          <span className="box booked-box"></span>
          Booked
        </div>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <h2>Booking Summary</h2>
        <p><strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</p>
        <p><strong>Tickets:</strong> {selectedSeats.length}</p>
        <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
      </div>

      {error && <p style={{ color: "#E50914", textAlign: "center" }}>{error}</p>}

      {bookingResult && (
        <div className="booking-summary">
          <h2>Booking Confirmed 🎉</h2>
          <p><strong>Seats:</strong> {bookingResult.seats.join(", ")}</p>
          <p><strong>Amount Paid:</strong> ₹{bookingResult.totalAmount}</p>
          <p><strong>Payment ID:</strong> {bookingResult.paymentId}</p>
        </div>
      )}

      {/* Button */}
      <div className="button-section">
        <button
          className="proceed-btn"
          onClick={handleProceedToPayment}
          disabled={submitting || selectedSeats.length === 0}
        >
          {submitting ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}

export default Booking;
