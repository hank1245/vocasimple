import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  userEmail: string;
  csvData: string;
  vocabularyCount: number;
  fileName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userEmail, csvData, vocabularyCount, fileName }: EmailRequest = await req.json();

    // Validate required fields
    if (!userEmail || !csvData || !fileName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get email configuration from environment variables
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUsername = Deno.env.get('SMTP_USERNAME');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const fromEmail = Deno.env.get('FROM_EMAIL');

    if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
      console.error('Missing SMTP configuration');
      return new Response(
        JSON.stringify({ error: 'Email service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create SMTP client
    const client = new SmtpClient();

    // Connect to SMTP server
    await client.connect({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUsername,
      password: smtpPassword,
    });

    // Email content
    const emailBody = `
안녕하세요,

요청하신 단어 목록을 CSV 파일로 보내드립니다.

📊 단어 통계:
- 총 단어 수: ${vocabularyCount}개
- 생성일: ${new Date().toLocaleDateString('ko-KR')}

첨부된 CSV 파일을 Excel이나 Google Sheets에서 열어보실 수 있습니다.

감사합니다.
VocaSimple 팀
    `;

    // Convert CSV data to base64 for attachment
    const csvBase64 = btoa(unescape(encodeURIComponent(csvData)));

    // Send email with attachment
    await client.send({
      from: fromEmail,
      to: userEmail,
      subject: `VocaSimple 단어 목록 - ${vocabularyCount}개 단어`,
      content: emailBody,
      attachments: [
        {
          filename: fileName,
          content: csvBase64,
          encoding: 'base64',
          contentType: 'text/csv; charset=utf-8',
        },
      ],
    });

    // Close SMTP connection
    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${vocabularyCount}개의 단어가 ${userEmail}로 전송되었습니다.` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});