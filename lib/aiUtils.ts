export async function sendToAi(image: File, endpoint: string) {
  if (!image) {
    throw new Error("No image provided");
  }
  const formdata = new FormData();
  formdata.append("image", image);

  const res = await fetch(endpoint, {
    method: "POST",
    body: formdata,
  });
  if (!res.ok) {
    // This reads the error text (like "404 Not Found") so you can see it in the console
    const errorText = await res.text();
    console.error(`API Error (${res.status}):`, errorText);
    throw new Error(`API failed with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
