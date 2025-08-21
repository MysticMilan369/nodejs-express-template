export const HTTP_STATUS_CODES = {
  // Success responses
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection messages
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client error responses
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS_CODES)[keyof typeof HTTP_STATUS_CODES];

// Status code categories
export const isSuccess = (code: number): boolean => code >= 200 && code < 300;
export const isRedirection = (code: number): boolean => code >= 300 && code < 400;
export const isClientError = (code: number): boolean => code >= 400 && code < 500;
export const isServerError = (code: number): boolean => code >= 500 && code < 600;

// Common status code groups
export const SUCCESS_CODES = [
  HTTP_STATUS_CODES.OK,
  HTTP_STATUS_CODES.CREATED,
  HTTP_STATUS_CODES.ACCEPTED,
  HTTP_STATUS_CODES.NO_CONTENT,
] as const;

export const CLIENT_ERROR_CODES = [
  HTTP_STATUS_CODES.BAD_REQUEST,
  HTTP_STATUS_CODES.UNAUTHORIZED,
  HTTP_STATUS_CODES.FORBIDDEN,
  HTTP_STATUS_CODES.NOT_FOUND,
  HTTP_STATUS_CODES.METHOD_NOT_ALLOWED,
  HTTP_STATUS_CODES.CONFLICT,
  HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
] as const;

export const SERVER_ERROR_CODES = [
  HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CODES.NOT_IMPLEMENTED,
  HTTP_STATUS_CODES.BAD_GATEWAY,
  HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
  HTTP_STATUS_CODES.GATEWAY_TIMEOUT,
] as const;

// Status messages
export const STATUS_MESSAGES: Record<HttpStatusCode, string> = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export const getStatusMessage = (code: HttpStatusCode): string => {
  return STATUS_MESSAGES[code] || 'Unknown Status';
};
