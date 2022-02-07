import { ref } from 'vue';

export default function(rootUrl) {
  let loading = ref(false);
  let progress = ref(0);

  let chunks = ref([]);
  let results = ref({});
  let errors = ref([]);

  let controller = null;

  async function getJson(path, options) {
    return _fetch('get', path, options);
  }

  async function postJson(path, options) {
    return _fetch('post', path, options);
  }

  async function _fetch(method, path, options) {
    _resetLocals();
    controller = new AbortController();
    const signal = controller.signal;
    loading.value = true;

    try {
      results.value = await fetchData();
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }

    async function fetchData() {
      const response = await fetch(`${rootUrl}${path}`, { method, signal, ...options });
      const { status } = response;
      if (status >= 200 && status < 300) {
        return JSON.parse(await _readBody(response));
      } else {
        throw new Error(await _readBody(response));
      }
    }
  }

  async function _readBody(response, encoding = 'utf-8') {
    const reader = response.body.getReader();
    const contentLength = _getContentLength();
    let received = ref(0);

    // Loop through the response stream and extract data chunks
    while (loading.value === true) {
      const { done, value: dataChunk } = await reader.read();

      if (done) {
        _finishLoading();
      } else {
        _handleLoadingProgress(dataChunk);
      }
    }

    const body = _assembleResponseBody(received.value);

    // Decode the response and return it
    return new TextDecoder(encoding).decode(body);

    function _getContentLength() {
      const hasContentLengthHeaders = response.headers.has('content-length');
      if (!hasContentLengthHeaders) {
        console.warn(
          'Cannot calculate serverside payload size. To use the progress indicator, you must configure the "content-length" header on your serverside'
        );
      }
      return +response.headers.get('content-length');
    }

    function _finishLoading() {
      loading.value = false;
    }

    function _handleLoadingProgress(dataChunk) {
      chunks.value.push(dataChunk);
      received.value += dataChunk.length;
      progress.value = (received.value * 100) / contentLength;
      console.log("🚀 ~ file: useMyFetch.ts ~ line 85 ~ _handleLoadingProgress ~ progress.value", progress.value)
    }

    function _assembleResponseBody(received) {
      let body = new Uint8Array(received);
      let position = 0;

      // Order the chunks by their respective position
      for (let chunk of chunks.value) {
        body.set(chunk, position);
        position += chunk.length;
      }
      return body;
    }
  }

  function _resetLocals() {
    loading.value = false;
    progress.value = 0;

    chunks.value = [];
    results.value = {};
    errors.value = [];

    controller = null;
  }

  function cancelRequest() {
    if (!controller) {
      throw new Error('Cannot cancel request - no AbortController was assigned');
    }
    controller.abort();
    return _resetLocals();
  }

  return { loading, progress, results, errors, cancelRequest, getJson, postJson };
}
