/*
=========================================================
ASTHA API CLIENT
=========================================================

Centralized API helper for the frontend.

Supports:

1. GET requests
2. POST requests
3. PUT requests
4. Authentication token
5. JSON request/response handling
6. Request timeout
7. AbortController support
8. Better network error handling

The API base URL is controlled through:

VITE_API_BASE_URL

If it is not provided, the frontend uses:

/api
=========================================================
*/

import { toWebp } from './imagePaths';


/*
=========================================================
API BASE URL
=========================================================
*/

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || '/api';


/*
=========================================================
REQUEST TIMEOUT
=========================================================

We use a generous timeout so normal slower connections
are not interrupted unnecessarily.

30 seconds is long enough for normal API operations but
prevents a permanently hanging request.
=========================================================
*/

const REQUEST_TIMEOUT = 30000;


/*
=========================================================
REQUEST HELPER
=========================================================
*/

async function request(
  path,
  options = {}
) {

  /*
  ========================================================
  AUTH TOKEN
  ========================================================
  */

  const token =
    localStorage.getItem(
      'astha_token'
    );


  /*
  ========================================================
  ABORT CONTROLLER
  ========================================================
  */

  const controller =
    new AbortController();


  /*
  ========================================================
  EXTERNAL SIGNAL SUPPORT
  ========================================================

  If a caller provides its own AbortSignal, we respect
  it while still maintaining our own timeout.

  This keeps the API helper compatible with components
  that may need to cancel requests.
  ========================================================
  */

  const externalSignal =
    options.signal;


  /*
  ========================================================
  REQUEST TIMEOUT
  ========================================================
  */

  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);


  /*
  ========================================================
  HEADERS
  ========================================================
  */

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };


  /*
  ========================================================
  AUTHORIZATION
  ========================================================
  */

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  /*
  ========================================================
  REQUEST OPTIONS
  ========================================================
  */

  const requestOptions = {
    ...options,
    headers,
    signal: controller.signal
  };


  /*
  ========================================================
  REMOVE INTERNAL SIGNAL
  ========================================================

  The external signal is handled separately above.
  We don't send it to fetch because our controller
  manages the request timeout.
  ========================================================
  */

  delete requestOptions.signal;


  /*
  ========================================================
  EXTERNAL ABORT HANDLER
  ========================================================
  */

  let handleExternalAbort;


  if (externalSignal) {

    handleExternalAbort = () => {
      controller.abort();
    };


    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        'abort',
        handleExternalAbort,
        { once: true }
      );
    }
  }


  /*
  ========================================================
  FETCH REQUEST
  ========================================================
  */

  try {

    const res = await fetch(
      `${API_BASE}${path}`,
      requestOptions
    );


    /*
    ======================================================
    RESPONSE PARSING
    ======================================================

    Some backend responses may not contain JSON.

    We therefore attempt JSON first and safely fall back
    to an empty object.
    ======================================================
    */

    const data =
      await res
        .json()
        .catch(() => ({}));


    /*
    ======================================================
    HTTP ERROR
    ======================================================
    */

    if (!res.ok) {

      const errorMessage =
        data?.error ||
        data?.message ||
        'Something went wrong. Please try again.';

      throw new Error(
        errorMessage
      );
    }


    /*
    ======================================================
    SUCCESS
    ======================================================
    */

    return toWebp(data);

  } catch (error) {

    /*
    ======================================================
    ABORT / TIMEOUT
    ======================================================
    */

    if (
      error?.name === 'AbortError'
    ) {

      throw new Error(
        'Request timed out or was cancelled. Please try again.'
      );
    }


    /*
    ======================================================
    NETWORK ERROR
    ======================================================
    */

    if (
      error instanceof TypeError
    ) {

      throw new Error(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }


    /*
    ======================================================
    EXISTING API ERROR
    ======================================================
    */

    throw error;

  } finally {

    /*
    ======================================================
    CLEANUP
    ======================================================

    Always clear the timeout so it does not remain active
    after a successful or failed request.
    ======================================================
    */

    clearTimeout(
      timeoutId
    );


    /*
    ======================================================
    CLEANUP EXTERNAL ABORT LISTENER
    ======================================================
    */

    if (
      externalSignal &&
      handleExternalAbort
    ) {

      externalSignal.removeEventListener(
        'abort',
        handleExternalAbort
      );
    }
  }
}


/*
=========================================================
PUBLIC API
=========================================================
*/

export const api = {

  /*
  ========================================================
  GET
  ========================================================
  */

  get: (path, options = {}) =>
    request(
      path,
      {
        ...options,
        method: 'GET'
      }
    ),


  /*
  ========================================================
  POST
  ========================================================
  */

  post: (
    path,
    body,
    options = {}
  ) =>
    request(
      path,
      {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
      }
    ),


  /*
  ========================================================
  PUT
  ========================================================
  */

  put: (
    path,
    body,
    options = {}
  ) =>
    request(
      path,
      {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
      }
    )
};