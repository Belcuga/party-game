import { NextResponse } from 'next/server';

const questions = [
  { id: 1, text: 'Who is most likely to start a dance battle?' },
  { id: 2, text: 'What’s your most embarrassing party story?' }
];

export async function GET() {
  return NextResponse.json(questions);
}