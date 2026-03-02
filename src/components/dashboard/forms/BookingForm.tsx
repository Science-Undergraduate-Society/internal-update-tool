"use client";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function BookingForm({ onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: collect form fields and call onSubmit(data)
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Booking</h2>
      {/* TODO: Add fields specific to Booking */}
      <button type="submit">Submit</button>
    </form>
  );
}
