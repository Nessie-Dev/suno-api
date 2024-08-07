import { NextResponse, NextRequest } from "next/server";
import { DEFAULT_MODEL, sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * desc
 *
 */
export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    let userMessage = null;
    const { messages, instance } = body;
    if (!instance || isNaN(Number(instance))) {
      return new NextResponse(JSON.stringify({ error: 'instance parameter is required and should be a valid number.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    for (let message of messages) {
      if (message.role == 'user') {
        userMessage = message;
      }
    }

    if (!userMessage) {
      return new NextResponse(JSON.stringify({ error: 'Prompt message is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }


    const apiInstance = await sunoApi(Number(instance));
    const audioInfo = await (await apiInstance).generate(userMessage.content, true, DEFAULT_MODEL, true);

    const audio = audioInfo[0]
    const data = `## Song Title: ${audio.title}\n![Song Cover](${audio.image_url})\n### Lyrics:\n${audio.lyric}\n### Listen to the song: ${audio.audio_url}`

    return new NextResponse(data, {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Error generating audio:', JSON.stringify(error.response.data));
    return new NextResponse(JSON.stringify({ error: 'Internal server error: ' + JSON.stringify(error.response.data.detail) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
