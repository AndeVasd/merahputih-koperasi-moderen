import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required", isValidKtp: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Kamu adalah AI yang bertugas memvalidasi dan mengekstrak data dari foto KTP Indonesia.

TUGAS:
1. Validasi apakah gambar adalah KTP Indonesia yang valid (ada header provinsi/kabupaten, ada NIK 16 digit, ada foto, ada data lengkap)
2. Jika valid, ekstrak data: NIK, Nama, dan Alamat lengkap (gabungkan Alamat + RT/RW + Kel/Desa + Kecamatan)

RESPONS dalam format JSON:
{
  "isValidKtp": true/false,
  "errorMessage": "pesan jika tidak valid",
  "data": {
    "nik": "16 digit NIK",
    "nama": "Nama lengkap",
    "alamat": "Alamat lengkap termasuk RT/RW, Kel/Desa, Kecamatan"
  }
}

Jika gambar bukan KTP (misalnya foto wajah biasa, foto selfie, foto lain), set isValidKtp: false dan berikan errorMessage yang jelas.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analisis gambar berikut dan ekstrak data KTP jika valid:"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      result = {
        isValidKtp: false,
        errorMessage: "Gagal memproses gambar. Pastikan foto KTP jelas dan tidak buram."
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ocr-ktp function:", error);
    return new Response(
      JSON.stringify({ 
        isValidKtp: false, 
        errorMessage: "Terjadi kesalahan saat memproses gambar. Silakan coba lagi." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
