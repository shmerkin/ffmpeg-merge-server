const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/merge', upload.fields([{ name: 'video' }, { name: 'audio' }]), (req, res) => {
  const video = req.files['video'][0];
  const audio = req.files['audio'][0];
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
      console.error(err);
      res.status(500).send('Error processing video.');
    })
    .run();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
