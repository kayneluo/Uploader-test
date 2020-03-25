# Uploader Test

## Features
-  ImgResolver
    - Parse Accept in header, return webp or normal format in response.

-  ImgUploader
   -  upload image and get the full URL
   -  gzip in static server
   -  generate a webp format.


## Needed
- cache (cdn, redis)
- testing
- query like /?size=300x400&format=webP
- hash in filename
- return real name in response