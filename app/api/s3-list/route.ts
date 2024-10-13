import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timestamp = searchParams.get('timestamp')

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    })

    const response = await s3Client.send(command)

    const filesPromises = response.Contents?.map(async (item) => {
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: item.Key,
      })
      const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }) // URL expires in 1 hour

      return {
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
        url: url,
      }
    }) || []

    const files = await Promise.all(filesPromises)

    return NextResponse.json({ files, timestamp })
  } catch (error) {
    console.error('Error listing S3 objects:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}