import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { MongoClient } from "mongodb";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const contact = formData.get("contact") as string;
  const file = formData.get("file") as File;
  const collectionName = formData.get("collectionName") as string;
  const priorAnnualReturn = formData.get("priorAnnualReturn") as string;
  const annualTurnover = formData.get("annualTurnover") as string;
  const fileMoreReturns = formData.get("fileMoreReturns") as string;

  if (!email || !username || !contact || !file || !collectionName) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", ""], // Allow any content type
      ],
      Fields: {
        "Content-Type": file.type,
      },
      Expires: 600, // 10 minutes
    });

    // Connect to MongoDB
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(collectionName);

    // Store form data in the database
    const submission = await collection.insertOne({
      name: username,
      email: email,
      contact: contact,
      priorAnnualReturn: priorAnnualReturn,
      annualTurnover: annualTurnover,
      fileMoreReturns: fileMoreReturns,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
      s3Key: fileName,
      createdAt: new Date(),
    });

    await mongoClient.close();

    return NextResponse.json({ url, fields, submission: submission.insertedId });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}