const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quiz API is running' });
});

// For now, no database logic.
// Could be expanded to save results to a real DB.

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
