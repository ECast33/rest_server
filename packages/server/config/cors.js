/**
 * ['chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop', undefined].indexOf(origin) !== -1 cors postman extension
 */
const allowedOrigins = [
    'http://192.168.0.1',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:4200',
    'http://localhost:8100',
    'http://dockerdev.designinteractive.net:8000',
    'http://qa.designinteractive.net:8000',
    'http://imitate.designinteractive.net',
];
module.exports = {
    CORS: {
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        credentials: true,
        origin: function (origin, callback) {
            // Whitelist origins
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true)
            } else {
                log.info(origin, 'Not allowed by CORS')
                callback(new Error(origin, 'Not allowed by CORS'))
            }
        }
    }
}
