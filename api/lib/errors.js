export function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

export function errorResponse(res, statusCode, message, details = null) {
  setCORSHeaders(res);
  res.status(statusCode).json({
    error: true,
    status: statusCode,
    message,
    ...(details && { details }),
  });
}

export function successResponse(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.status(statusCode).json({
    error: false,
    status: statusCode,
    data,
  });
}

export async function handleRequest(req, res, handler) {
  try {
    if (handleOptions(req, res)) return;
    setCORSHeaders(res);
    await handler(req, res);
  } catch (err) {
    console.error('API Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    errorResponse(res, statusCode, message);
  }
}
