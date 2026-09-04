const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Sends an image to the GhostReveal backend for prediction.
 * Matches: POST /predict/  (multipart form-data, field name "img")
 * Success -> { prediction: string, confidence: number }
 * Failure -> { error: string }
 */
export async function predictImage(file) {
  const formData = new FormData();
  formData.append("img", file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/predict/`, {
      method: "POST",
      body: formData,
    });
  } catch (networkError) {
    throw new Error(
      "Couldn't reach the server. Make sure the backend is running and reachable."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server sent back something unexpected.");
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || "Something went wrong analyzing the image.");
  }

  return data; // { prediction, confidence }
}
