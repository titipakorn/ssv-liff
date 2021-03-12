#!/bin/sh

cd build

echo '[1/2] Move sw.js & workbox-sw.js to /dash/';

mv sw.js* ./dash/
mv workbox-sw.js* ./dash/

echo '[2/2] Change path /static/ to /dash/static/';

find dash -type f -maxdepth 1 | LC_ALL=C xargs -I{} sed -i -e 's,static/,dash/static/,g' {}

find dash -type f -maxdepth 1 | LC_ALL=C xargs -I{} sed -i'' -e 's,dash/dash/,dash/,g' {}

