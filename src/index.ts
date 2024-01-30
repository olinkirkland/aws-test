// Import the AWS SDK
import { Credentials, S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Set your AWS credentials
const credentials = new Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
});

// Set the AWS region
const region = 'eu-north-1'; // Change to your desired AWS region
const s3 = new S3({ credentials, region });

// listObjectsInBucket('olin-kirkland-hello-world-bucket');

// List all objects in a bucket
function listObjectsInBucket(bucketName: string) {
  s3.listObjects({ Bucket: bucketName }, (err, data) => {
    if (err) {
      console.error('Error listing objects in bucket:', err);
    } else {
      console.log('Objects in bucket:');
      data.Contents?.forEach((object) => {
        console.log(object.Key);
      });
    }
  });
}

const app = express();
app.use(cors());

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for handling image uploads
app.post('/upload', upload.single('image'), async (req, res) => {
  console.log('Uploading image');
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageId = uuidv4();
    const s3 = new S3({ params: { Bucket: 'your-s3-bucket' } });

    const params = {
      Bucket: 'olin-kirkland-hello-world-bucket',
      Key: imageId,
      Body: req.file.buffer
    };

    s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
      if (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ error: 'Error uploading image' });
      } else {
        console.log('Image uploaded successfully:', data);
        res.json({ imageId }).status(200);
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for getting a list of all images
app.get('/images', async (req, res) => {
  console.log('Retrieving images');
  try {
    const s3 = new S3({ params: { Bucket: 'your-s3-bucket' } });

    const params = {
      Bucket: 'olin-kirkland-hello-world-bucket'
    };

    s3.listObjects(params, (err: Error, data: S3.ListObjectsOutput) => {
      if (err) {
        console.error('Error retrieving images:', err);
        res.status(500).json({ error: 'Error retrieving images' });
      } else {
        console.log(`Images retrieved successfully ${data.Contents?.length}`);
        res
          .json(
            Array.from(data.Contents || []).map(
              (file) =>
                `https://${params.Bucket}.s3.eu-north-1.amazonaws.com/${file.Key}`
            )
          )
          .status(200);
      }
    });
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for handling image retrieval
app.get('/image/:id', async (req, res) => {
  console.log('Retrieving image');
  try {
    const imageId = req.params.id;
    const s3 = new S3({ params: { Bucket: 'your-s3-bucket' } });

    const params = {
      Bucket: 'olin-kirkland-hello-world-bucket',
      Key: imageId
    };

    s3.getObject(params, (err: Error, data: S3.GetObjectOutput) => {
      if (err) {
        console.error('Error retrieving image:', err);
        res.status(500).json({ error: 'Error retrieving image' });
      } else {
        console.log('Image retrieved successfully');
        res.json({ image: data.Body }).status(200);
      }
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
