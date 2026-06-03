// Importiamo la libreria swagger-jsdoc per generare la documentazione
const swaggerJsdoc = require("swagger-jsdoc");

// Configurazione completa di Swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API - Prenota!",
            version: "1.0.0",
            description: "API backend per la piattaforma di prenotazione tavoli Prenota!",
        },
        // Definiamo il server locale
        servers: [
            {
                url: "http://localhost:3000",
                description: "Server Locale di Sviluppo",
            },
        ],
        // I tag ci permettono di dividere visivamente la pagina in sezioni ordinate
        tags: [
            { name: "AuthController", description: "Registrazione e autenticazione utente" },
            { name: "ReservationController", description: "Gestione prenotazioni dei tavoli" },
        ],
        // Definiamo i componenti riutilizzabili: la sicurezza JWT e la forma dei dati
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Inserisci il token JWT ottenuto dal login",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
                        name: { type: "string", example: "Mario Rossi" },
                        email: { type: "string", format: "email", example: "mario@email.it" },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Mario Rossi" },
                        email: { type: "string", format: "email", example: "mario@email.it" },
                        password: { type: "string", minLength: 6, example: "password123" },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "mario@email.it" },
                        password: { type: "string", example: "password123" },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Login effettuato con successo." },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                    },
                },
                Reservation: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "665a1b2c3d4e5f6789012345" },
                        user: { type: "string", example: "665a1b2c3d4e5f6789012345" },
                        date: { type: "string", format: "date", example: "2026-06-15" },
                        time: { type: "string", example: "20:30" },
                        numberOfPeople: { type: "integer", example: 4 },
                        status: { type: "string", enum: ["confermata", "cancellata"], example: "confermata" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                ReservationRequest: {
                    type: "object",
                    required: ["date", "time", "numberOfPeople"],
                    properties: {
                        date: { type: "string", format: "date", example: "2026-06-15" },
                        time: { type: "string", example: "20:30" },
                        numberOfPeople: { type: "integer", minimum: 1, maximum: 20, example: 4 },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Messaggio di errore" },
                        error: { type: "string", example: "Dettaglio tecnico" },
                    },
                },
            },
        },
        // Qui mappiamo a mano tutte le rotte e i codici di risposta (200, 201, 204, 400, 500, ecc.)
        paths: {
            "/api/auth/register": {
                post: {
                    tags: ["AuthController"],
                    summary: "Registrazione di un nuovo utente",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RegisterRequest" },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Utente registrato con successo",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: { message: { type: "string", example: "Utente registrato con successo." } },
                                    },
                                },
                            },
                        },
                        400: {
                            description: "Errore di validazione o utente già esistente",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                        500: {
                            description: "Errore interno del server",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                    },
                },
            },
            "/api/auth/login": {
                post: {
                    tags: ["AuthController"],
                    summary: "Login di un utente",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
                        },
                    },
                    responses: {
                        200: {
                            description: "Login effettuato con successo",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
                        },
                        401: {
                            description: "Credenziali non valide",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                        500: {
                            description: "Errore interno del server",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                    },
                },
            },
            "/api/reservations": {
                get: {
                    tags: ["ReservationController"],
                    summary: "Ottieni le prenotazioni dell'utente autenticato",
                    security: [{ bearerAuth: [] }], // Richiede il token
                    responses: {
                        200: {
                            description: "Lista delle prenotazioni",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } },
                                },
                            },
                        },
                        401: {
                            description: "Token mancante o non valido",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                        500: {
                            description: "Errore interno del server",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                    },
                },
                post: {
                    tags: ["ReservationController"],
                    summary: "Crea una nuova prenotazione",
                    security: [{ bearerAuth: [] }], // Richiede il token
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ReservationRequest" } },
                        },
                    },
                    responses: {
                        201: {
                            description: "Prenotazione effettuata con successo",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: { type: "string", example: "Prenotazione confermata con successo" },
                                            reservation: { $ref: "#/components/schemas/Reservation" },
                                        },
                                    },
                                },
                            },
                        },
                        400: {
                            description: "Dati non validi",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                        500: {
                            description: "Errore interno del server",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                    },
                },
            },
            "/api/reservations/{id}": {
                delete: {
                    tags: ["ReservationController"],
                    summary: "Elimina una prenotazione",
                    security: [{ bearerAuth: [] }], // Richiede il token
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                            description: "Id della prenotazione da eliminare",
                        },
                    ],
                    responses: {
                        204: {
                            description: "Prenotazione eliminata con successo",
                        },
                        404: {
                            description: "Prenotazione non trovata",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                        500: {
                            description: "Errore interno del server",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
                        },
                    },
                },
            },
        },
    },
    apis: [],
};

// Generiamo le specifiche e le esportiamo
const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;