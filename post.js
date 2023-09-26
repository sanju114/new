const postRequest = async (method, url, body) => {
  const requestOptions = {
    method: method,
    headers: {
      'Content-Type': 'application/json' // Set the content type to JSON
    },
    body: JSON.stringify(body) // Convert the data to JSON format
  }

  // '{  }'
  const response = await fetch(url, requestOptions)
  const data = await response.json()
  return data
}

export default postRequest
