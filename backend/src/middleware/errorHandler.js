export default function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: 'Internal server error' });
}


