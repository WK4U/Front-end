import Constants from "expo-constants";
import appJson from "../../app.json";

// Resolve Cloudinary config from app.json extra or env vars
const CLOUD_NAME =
  appJson?.expo?.extra?.cloudinary?.cloudName ||
  Constants?.expoConfig?.extra?.cloudinary?.cloudName ||
  Constants?.manifest?.extra?.cloudinary?.cloudName ||
  process.env?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  null;

const UPLOAD_PRESET =
  appJson?.expo?.extra?.cloudinary?.uploadPreset ||
  Constants?.expoConfig?.extra?.cloudinary?.uploadPreset ||
  Constants?.manifest?.extra?.cloudinary?.uploadPreset ||
  process.env?.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  null;

/**
 * Upload a local image (uri/base64) directly to Cloudinary using an unsigned preset.
 * Returns the full Cloudinary response; use response.secure_url.
 * photo can be:
 *  - { uri: string, base64?: string, fileName?: string, type?: string }
 *  - string uri
 */
export async function uploadToCloudinary(photo, folder = "w4u") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary não configurado. Defina expo.extra.cloudinary.cloudName e uploadPreset no app.json ou as envs EXPO_PUBLIC_CLOUDINARY_*"
    );
  }

  // Normalize input
  let uri = null;
  let base64 = null;
  let type = "image/jpeg";
  let fileName = "upload.jpg";

  if (typeof photo === "string") {
    uri = photo;
  } else if (photo && typeof photo === "object") {
    uri = photo.uri || null;
    base64 = photo.base64 || null;
    type = photo.type || type;
    fileName = photo.fileName || photo.filename || fileName;
  }

  const form = new FormData();
  form.append("upload_preset", UPLOAD_PRESET);
  if (folder) form.append("folder", folder);

  if (base64) {
    // Send as data URL base64
    const dataUrl = `data:${type};base64,${base64}`;
    form.append("file", dataUrl);
  } else if (uri) {
    form.append("file", { uri, name: fileName, type });
  } else {
    throw new Error("Foto inválida para upload (sem uri ou base64)");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Falha no upload Cloudinary: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json; // { secure_url, public_id, ... }
}

export function isRemoteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}
