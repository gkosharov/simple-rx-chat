/**
 * Server Entry File
 */

import express from 'express'

process.chdir(__dirname)

express()
    .use(express.static('./static'))
    .use(express.static('../static'))
    .get('*', (req, res) => {
        res.type('html').end(template('Hello'))
    })
    .listen(8888, () => console.log('App is listening on http://localhost:8888/'))


function template (body = '') {
return `
<!DOCTYPE html>
<html>
<head>
    <title>Fullstack Challenge</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="/normalize.css" rel="stylesheet">
</head>
<body>
</body>
    <div id='app'>${body}</div>
    <script src="/client.js"></script>
</html>
`
}
