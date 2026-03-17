const CONTACT_NOTE = (
  <p>Having issues? Contact <strong>webdeveloper@sus.ubc.ca</strong> or reach out to the webdev team on Slack.</p>
);

export const PAGE_HELP: Record<string, { title: string; content: React.ReactNode }> = {
  "/submission": {
    title: "Submitting an update",
    content: (
      <>
        <ol>
          <li>Select a category: Events, Clubs, Tutors, Pantry, or Initiatives.</li>
          <li>Fill in the relevant fields and click Submit.</li>
          <li>Your submission enters the review queue and will appear on the public site once approved.</li>
        </ol>
        <p>If you are editing an existing item, the form will be pre-filled. The live item stays unchanged until the edit is approved.</p>
        <p>Use the Preview button on events and initiatives to see how your item will look on the public site before submitting.</p>
        {CONTACT_NOTE}
      </>
    ),
  },
  "/dashboard": {
    title: "Managing existing items",
    content: (
      <>
        <ol>
          <li>Select a category from the dropdown to browse live items.</li>
          <li>Click Edit to propose changes. You will be taken to the submission form pre-filled with the current data.</li>
          <li>Click Delete to submit a deletion request. The item stays live until a reviewer approves it.</li>
        </ol>
        <p><strong>Banners on cards:</strong></p>
        <ul>
          <li>Edit Pending Review: an edit has been submitted and is waiting for approval.</li>
          <li>Deletion Pending Review: a deletion request is in the queue. </li>
          <li>Once a delete/edit action is submitted, the same item cannot be deleted/edited until it is resolved.</li>
        </ul>
        {CONTACT_NOTE}
      </>
    ),
  },
  "/review": {
    title: "Reviewing submissions",
    content: (
      <>
        <p>This page is only for VP Communications, AVP Communications, and the Web Developer accounts.</p>
        <p><strong>Submission types:</strong></p>
        <ul>
          <li>New Submission</li>
          <li>Edit Request</li>
          <li>Deletion Request</li>
        </ul>
        <p><strong>Review actions:</strong></p>
        <ul>
          <li>Click Approve to publish the change. The public site updates automatically.</li>
          <li>Click Reject to discard the submission. Existing live content is left unchanged.</li>
        </ul>
        {CONTACT_NOTE}
      </>
    ),
  },
};

export const DEFAULT_HELP = {
  title: "Need help?",
  content: (
    <>
      <p>Contact <strong>webdeveloper@sus.ubc.ca</strong> or reach out to the webdev team on Slack.</p>
    </>
  ),
};
