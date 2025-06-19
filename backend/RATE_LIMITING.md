# Rate Limiting Configuration

This application uses `express-rate-limit` to protect against abuse and ensure fair usage. Rate limiting can be configured via environment variables.

## Environment Variables

### General Rate Limiting (applied to all routes)
```env
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX=100                   # 100 requests per window
RATE_LIMIT_MESSAGE="Too many requests from this IP, please try again later."
RATE_LIMIT_STANDARD_HEADERS=true     # Include standard rate limit headers
RATE_LIMIT_LEGACY_HEADERS=true       # Include legacy rate limit headers
RATE_LIMIT_SKIP_SUCCESSFUL=false     # Don't skip successful requests
RATE_LIMIT_SKIP_FAILED=false         # Don't skip failed requests
```

### Authentication Rate Limiting (stricter for login/register)
```env
AUTH_RATE_LIMIT_WINDOW_MS=900000     # 15 minutes in milliseconds
AUTH_RATE_LIMIT_MAX=5                # 5 attempts per 15 minutes
AUTH_RATE_LIMIT_MESSAGE="Too many authentication attempts, please try again later."
```

### API Key Rate Limiting (higher limits for authenticated API calls)
```env
API_KEY_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
API_KEY_RATE_LIMIT_MAX=1000          # 1000 requests per 15 minutes
API_KEY_RATE_LIMIT_MESSAGE="API rate limit exceeded, please try again later."
```

## Default Values

If no environment variables are set, the following defaults apply:

- **General**: 100 requests per 15 minutes
- **Auth**: 5 attempts per 15 minutes  
- **API Key**: 1000 requests per 15 minutes

## Response Headers

When rate limiting is active, the following headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)
- `Retry-After`: Seconds to wait before retrying

## Error Response

When rate limit is exceeded, a 429 status code is returned with:

```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900,
  "limit": 100,
  "windowMs": 900000
}
```

## Recommendations

- **Production**: Use stricter limits (lower MAX values)
- **Development**: Use higher limits for testing
- **Auth endpoints**: Keep strict limits to prevent brute force attacks
- **API endpoints**: Adjust based on your application's needs 