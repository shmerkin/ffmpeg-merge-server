const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/merge', upload.fields([{ name: 'video' }, { name: 'audio' }]), (req, res) => {
  console.log('📥 Incoming files:', req.files); // Log incoming files

  const video = req.files['video']?.[0];
  const audio = req.files['audio']?.[0];

  if (!video || !audio) {
    console.error('❗ Missing required files');
    return res.status(400).send('Missing video or audio file.');
  }

  const outputPath = `output-${Date.now()}.mp4`;

  ffmpeg()
    .input(video.path)
    .input(audio.path)
    .outputOptions('-shortest')
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(video.path);
        fs.unlinkSync(audio.path);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error('❌ FFmpeg Error:', err);
      res.status(500).send('Error processing video.');
    })
    .run();
});

app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});
