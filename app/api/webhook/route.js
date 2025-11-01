export async function POST(req) {
  const body = await req.json();
  console.log('Webhook received:', body); // Log events (e.g., miniapp_added)
  // TODO: Store tokens in DB for sending notifications
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}