import qs from "qs";

/**
 * Generate URL query parameters from an object
 */
export function generateQueryParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      // Handle arrays and objects by JSON.stringify
      const encodedValue = encodeURIComponent(
        typeof value === "string" ? value : JSON.stringify(value)
      );
      return `${encodeURIComponent(key)}=${encodedValue}`;
    })
    .join("&");
}

/**
 * Parse URL query parameters into an object
 */
export function parseQueryParams(queryString: string): Record<string, unknown> {
  if (!queryString) {
    return {};
  }

  const params: Record<string, unknown> = {};
  const query = new URLSearchParams(queryString);
  for (const [key, value] of Array.from(query.entries())) {
    try {
      // Attempt to parse JSON strings
      params[key] = JSON.parse(decodeURIComponent(value));
    } catch (e) {
      console.log("🚀 ~ parseQueryParams ~ e:", e);
      // Fallback to string if parsing fails
      params[key] = decodeURIComponent(value);
    }
  }
  return params;
}

export const getQueryString = (query = {}) => {
  const config = qs.stringify(query, { encodeValuesOnly: true });
  return config ? `?${config}` : "";
};
