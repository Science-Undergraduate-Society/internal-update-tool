const SECTIONS: {
  value: SectionKey;
  label: string;
  icon: string;
}[] = [
  { value: "clubs", label: "Clubs", icon: "◈" },
  { value: "tutors", label: "Tutors", icon: "◉" },
  { value: "events", label: "Events", icon: "◆" },
  { value: "executives", label: "Executives", icon: "◇" },
  { value: "booking", label: "Booking & Fees", icon: "▣" },
  { value: "grants", label: "Grants & Subsidies", icon: "◎" },
  { value: "bluecard", label: "Blue Card Collaborators", icon: "▤" },
];

const FORM_FIELDS: Record<SectionKey, FormField[]> = {
  clubs: [
    { name: "clubName", label: "Club Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
    { name: "website", label: "Website URL", type: "text" },
    { name: "logo", label: "Club Logo", type: "file" },
  ],
  tutors: [
    { name: "tutorName", label: "Tutor Name", type: "text" },
    { name: "course", label: "Course Code", type: "text" },
    { name: "availability", label: "Availability", type: "textarea" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
  ],
  events: [
    { name: "title", label: "Event Title", type: "text" },
    { name: "date", label: "Date", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "location", label: "Location", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "link", label: "Registration Link", type: "text" },
    { name: "poster", label: "Event Poster", type: "file" },
  ],
  executives: [
    { name: "name", label: "Executive Name", type: "text" },
    { name: "role", label: "Role / Position", type: "text" },
    { name: "officeHours", label: "Office Hours", type: "textarea" },
    { name: "email", label: "Email", type: "text" },
    { name: "photo", label: "Photo", type: "file" },
  ],
  booking: [
    { name: "roomName", label: "Room / Space Name", type: "text" },
    { name: "capacity", label: "Capacity", type: "text" },
    { name: "fee", label: "Fee", type: "text" },
    { name: "bookingLink", label: "Booking Link", type: "text" },
    { name: "notes", label: "Additional Notes", type: "textarea" },
  ],
  grants: [
    { name: "grantName", label: "Grant Name", type: "text" },
    { name: "amount", label: "Amount", type: "text" },
    { name: "deadline", label: "Deadline", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "applyLink", label: "Application Link", type: "text" },
  ],
  bluecard: [
    { name: "businessName", label: "Business Name", type: "text" },
    { name: "discount", label: "Discount / Offer", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "website", label: "Website", type: "text" },
    { name: "logo", label: "Business Logo", type: "file" },
  ],
};

const PENDING: PendingSubmission[] = [
  {
    id: "1",
    section: "clubs",
    submittedBy: "alice@sus.ubc.ca",
    data: { clubName: "Robotics Club", description: "We build robots." },
  },
  {
    id: "2",
    section: "events",
    submittedBy: "bob@sus.ubc.ca",
    data: { title: "Spring AGM", date: "2025-03-15", location: "NEST 206" },
  },
];