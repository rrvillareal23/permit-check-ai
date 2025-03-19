import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { city, county, township } = await req.json();
    if (!city || !county) {
      return NextResponse.json(
        { error: "Location details are required" },
        { status: 400 }
      );
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an AI that determines whether an electrical permit is needed for EV chargers.",
            },
            {
              role: "user",
              content: `I am installing a 60-amp Level 2 EV charging station in ${city}, ${county}, ${township}. Do I need an electrical permit and how much is the fee to the AHJ?`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok || !openaiResponse.body) {
      return NextResponse.json(
        { error: "Failed to get permit info" },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = openaiResponse.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(encoder.encode(chunk));
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve permit information" },
      { status: 500 }
    );
  }
}
