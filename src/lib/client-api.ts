export async function requestJson<T>(
  url: string,
  body: unknown,
  method = "POST",
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Connection interrupted. Please retry; your cart is still saved.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(result?.error ?? "The request failed. Please try again.");
  return result as T;
}
