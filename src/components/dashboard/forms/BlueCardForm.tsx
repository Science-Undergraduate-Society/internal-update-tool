"use client";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function BlueCardForm({ onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: collect form fields and call onSubmit(data)
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>BlueCard</h2>
      {/* TODO: Add fields specific to BlueCard */}
      <button type="submit">Submit</button>
    </form>
  );
}
