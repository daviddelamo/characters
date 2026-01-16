import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.error("Missing Google API Key or Custom Search Engine ID");
        // Returning a 503 Service Unavailable or 400 Bad Request depending on if it's config error
        return NextResponse.json({
            error: "Google Search is not configured on the server. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID."
        }, { status: 503 });
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=8`;

        const res = await fetch(url);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Google Search API Error:", errorData);
            return NextResponse.json({ error: "Failed to fetch images from Google" }, { status: res.status });
        }

        const data = await res.json();
        const items = data.items || [];

        // Extract relevant fields
        const images = items.map((item: any) => ({
            link: item.link,
            thumbnailLink: item.image?.thumbnailLink || item.link,
            title: item.title,
            contexthLink: item.image?.contextLink
        }));

        return NextResponse.json({ images });
    } catch (error) {
        console.error("Internal Error during Google Search:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
