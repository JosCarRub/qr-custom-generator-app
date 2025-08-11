export const prerender = false;

export async function POST({ request, url }) {
  try {

    const size = url.searchParams.get('size');
    const fill_color = url.searchParams.get('fill_color');
    const back_color = url.searchParams.get('back_color');

    // El resto de los datos vienen como FormData
    const formData = await request.formData();
    const text = formData.get('text');
    const logo = formData.get('logo'); 

    const pythonApiBaseUrl = import.meta.env.API_PATH;
    if (!pythonApiBaseUrl) {
      throw new Error("La URL de la API de Python no está configurada.");
    }

    
    const pythonApiUrl = new URL(`${pythonApiBaseUrl}/qr/customize`);
    pythonApiUrl.searchParams.append('size', size);
    pythonApiUrl.searchParams.append('fill_color', fill_color);
    pythonApiUrl.searchParams.append('back_color', back_color);

    // Reconstruimos el FormData para Python
    const pythonFormData = new FormData();
    pythonFormData.append('text', text);
    if (logo) {
      pythonFormData.append('logo', logo, logo.name);
    }

    const pythonApiResponse = await fetch(pythonApiUrl, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonApiResponse.ok) {
      const errorBody = await pythonApiResponse.text();
      console.error("Error desde la API de Python:", errorBody);
      return new Response('Error al contactar el servicio de QR', { status: 502 });
    }

    const imageBlob = await pythonApiResponse.blob();
    return new Response(imageBlob, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });

  } catch (error) {
    console.error("Error en el endpoint de Astro:", error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}