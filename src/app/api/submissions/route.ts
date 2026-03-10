import { NextRequest, NextResponse } from "next/server";
import { createSubmission, getPendingSubmissions } from "../../../lib/firestore";

export async function GET() {
  try {
    const submissions = await getPendingSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, data, submittedBy } = body;
    const ref = await createSubmission({ section, data, submittedBy });
    return NextResponse.json({ id: ref.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
