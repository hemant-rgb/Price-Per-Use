import { ShareablePayload, ProductInput, CurrencyCode } from "@/types/product";

/**
 * Encodes comparison state into a URL-safe Base64 query parameter string.
 */
export function encodeShareState(payload: ShareablePayload): string {
  try {
    // Strip unnecessary whitespace and clean inputs
    const sanitizedProducts: ProductInput[] = payload.products.map((p) => ({
      ...p,
      name: p.name.trim(),
    }));

    const cleanPayload: ShareablePayload = {
      version: payload.version || 1,
      title: payload.title?.trim() || "PricePerUse Comparison",
      currency: payload.currency || "INR",
      products: sanitizedProducts,
    };

    const json = JSON.stringify(cleanPayload);
    // Safe utf-8 base64 encoding
    let base64 = "";
    if (typeof window !== "undefined") {
      base64 = window.btoa(
        encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
    } else {
      base64 = Buffer.from(json, "utf-8").toString("base64");
    }

    return encodeURIComponent(base64);
  } catch (error) {
    console.error("Failed to encode share state:", error);
    return "";
  }
}

/**
 * Decodes URL query string into a validated ShareablePayload object.
 * Returns null if the payload is malformed or invalid.
 */
export function decodeShareState(encodedString: string): ShareablePayload | null {
  try {
    if (!encodedString || typeof encodedString !== "string") return null;

    const rawBase64 = decodeURIComponent(encodedString);
    let json = "";

    if (typeof window !== "undefined") {
      const binaryString = window.atob(rawBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder("utf-8");
      json = decoder.decode(bytes);
    } else {
      json = Buffer.from(rawBase64, "base64").toString("utf-8");
    }

    const data = JSON.parse(json);

    // Validate schema
    if (!data || typeof data !== "object") return null;
    if (!Array.isArray(data.products) || data.products.length === 0) return null;

    // Validate currency
    const validCurrencies: CurrencyCode[] = ["INR", "USD", "EUR", "GBP"];
    const currency: CurrencyCode = validCurrencies.includes(data.currency)
      ? data.currency
      : "INR";

    return {
      version: typeof data.version === "number" ? data.version : 1,
      title: typeof data.title === "string" ? data.title : "Shared Comparison",
      currency,
      products: data.products as ProductInput[],
    };
  } catch {
    // Malformed input recovery
    return null;
  }
}

/**
 * Construct the full shareable URL given current state.
 */
export function generateShareUrl(
  payload: ShareablePayload,
  origin: string = ""
): string {
  const encoded = encodeShareState(payload);
  if (!encoded) return origin;
  const baseUrl = origin.split("?")[0];
  return `${baseUrl}?data=${encoded}`;
}
