import {CorsOptions} from "cors";

export class CorsService {

    // Allowed origins — the Angular dev server and the production SPA origin
    getOptions(): CorsOptions {
        return {
            origin: [
                'http://localhost:4200',
                process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
            ],
            credentials: true,
        };
    }
}
