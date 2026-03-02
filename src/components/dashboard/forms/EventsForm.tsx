"use client";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function EventsForm({ onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: collect form fields and call onSubmit(data)
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Events</h2>
      {/* TODO: Add fields specific to Events */}
      <button type="submit">Submit</button>
    </form>
  );
}
