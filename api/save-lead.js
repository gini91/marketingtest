module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  // This is a test function to check if the serverless function is being invoked.
  // If you see this message in the browser console or Vercel logs, the function is working.
  res.status(200).send('Test function executed successfully.');
};