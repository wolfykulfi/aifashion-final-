// Google Cloud Vision API utility for object localization

const GCLOUD_VISION_KEY = "AIzaSyAQk_SpzGLFI6qS0Q9fkBTsUnBMp30eHF0";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function detectClothingItems(base64Image: string) {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GCLOUD_VISION_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'OBJECT_LOCALIZATION' }]
          }
        ]
      })
    }
  );
  const data = await response.json();
  if (data.error) {
    console.error('Vision API error:', data.error);
    return [];
  }
  if (!data.responses || !Array.isArray(data.responses) || !data.responses[0]) {
    console.error('Unexpected Vision API response:', data);
    return [];
  }
  return data.responses[0].localizedObjectAnnotations || [];
}

export const CLOTHING_LABELS = [
  "Shirt", "Pants", "Dress", "Coat", "Jacket", "Skirt", "Shorts", "T-shirt", "Sweater"
]; 