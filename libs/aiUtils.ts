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

  const data = await res.json();
  return data;
}
