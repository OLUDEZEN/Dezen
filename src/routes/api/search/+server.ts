import { json } from '@sveltejs/kit';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_API_KEY } from '$env/static/private';

export const GET = async ({ url }) => {
    const query = url.searchParams.get('query');
    if (!query) return json({ error: 'Missing query' }, { status: 400 });

    // Get Spotify token
    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // Spotify tracks
    const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const spotifyData = await spotifyRes.json();
    console.log(spotifyData);

    // YouTube videos
    const youtubeRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const youtubeData = await youtubeRes.json();
    console.log(youtubeData);

    return json({ spotify: spotifyData, youtube: youtubeData });
};
