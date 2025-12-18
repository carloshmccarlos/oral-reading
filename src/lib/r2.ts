// Cloudflare R2 upload utility using S3-compatible API
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Initialize S3 client for R2
function getR2Client () {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials in environment variables')
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
}

// Join base URL and path, handling trailing/leading slashes
function joinUrl (baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/g, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return `${normalizedBase}/${normalizedPath}`
}

// Upload audio buffer to R2 and return public URL
export async function uploadAudioToR2 (
  audioBuffer: Buffer,
  scenarioSlug: string
): Promise<string> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL

  if (!bucketName || !publicUrl) {
    throw new Error('Missing R2 bucket name or public URL in environment variables')
  }

  const client = getR2Client()
  const objectKey = `stories/audio/${scenarioSlug}.mp3`

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: audioBuffer,
      ContentType: 'audio/mpeg'
    })
  )

  return joinUrl(publicUrl, objectKey)
}
