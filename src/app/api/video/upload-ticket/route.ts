import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      // In development / demo mode, return mock upload ticket
      const mockGuid = `demo-video-${Date.now()}`;
      return NextResponse.json({
        videoId: mockGuid,
        uploadUrl: `https://video.bunnycdn.com/library/demo/videos/${mockGuid}`,
        embedUrl: `https://iframe.mediadelivery.net/embed/demo/${mockGuid}`,
        demoMode: true,
      });
    }

    // Call Bunny.net Stream API to register new video
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || 'New Commercial Cut' }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      videoId: data.guid,
      uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${data.guid}`,
      embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${data.guid}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate Bunny upload ticket' },
      { status: 500 }
    );
  }
}
