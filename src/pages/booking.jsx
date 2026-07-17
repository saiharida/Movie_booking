import React from "react";
import "./booking.css";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 9;

const bookedSeats = [
  "A3", "A4",
  "B6",
  "C2", "C3",
  "D8",
  "E5",
  "F1",
  "G7",
  "H4"
];

function Booking() {
  return (
    <div className="booking-page">

      {/* Movie Details */}
      <div className="movie-info">
        <h1>Book Your Tickets</h1>

        <div className="details">
          <p><strong>Movie:</strong> Avengers: Endgame</p>
          <p><strong>Theatre:</strong> PVR Cinemas</p>
          <p><strong>Date:</strong> 20 July 2026</p>
          <p><strong>Show Time:</strong> 7:30 PM</p>
        </div>
      </div>

      {/* Screen */}
      <div className="screen-section">
        <div className="screen-line"></div>
        <p>SCREEN</p>
      </div>

      {/* Seat Layout */}
      <div className="seat-layout">
        {rows.map((row) => (
          <div className="seat-row" key={row}>
            {Array.from({ length: seatsPerRow }, (_, index) => {
              const seatNo = `${row}${index + 1}`;
              const isBooked = bookedSeats.includes(seatNo);

              return (
                <button
                  key={seatNo}
                  className={`seat ${isBooked ? "booked" : ""}`}
                  disabled={isBooked}
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

        <p><strong>Selected Seats:</strong> None</p>
        <p><strong>Tickets:</strong> 0</p>
        <p><strong>Total Amount:</strong> ₹0</p>
      </div>

      {/* Button */}
      <div className="button-section">
        <button className="proceed-btn">
          Proceed to Payment
        </button>
      </div>

    </div>
  );
}

export default Booking;