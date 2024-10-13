import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "File key is required" },
      { status: 400 }
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (response.Body instanceof Readable) {
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      const fileContent = Buffer.concat(chunks);

      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": response.ContentType || "application/octet-stream",
        },
      });
    } else {
      throw new Error("Unexpected response body type");
    }
  } catch (error) {
    console.error("Error fetching S3 object:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
