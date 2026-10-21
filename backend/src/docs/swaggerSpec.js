const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LifeTrack REST API',
    version: '1.0.0',
    description: 'Oficjalna dokumentacja interfejsu programistycznego (API) dla systemu zarządzania finansami LifeTrack. Zbudowane w oparciu o Node.js, Express, PostgreSQL oraz Prisma ORM.',
    contact: {
      name: 'LifeTrack Team',
      url: 'https://github.com/dimarajn/LifeTrack'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Lokalny serwer deweloperski (Local Development)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Wprowadź token JWT uzyskany po rejestracji lub logowaniu w formacie: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'demo@lifetrack.app' },
          name: { type: 'string', example: 'Dmitry' },
          currency: { type: 'string', example: 'PLN' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'secret123' },
          name: { type: 'string', example: 'Jan Kowalski' },
          currency: { type: 'string', example: 'PLN', enum: ['PLN', 'EUR', 'USD', 'GBP'] }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'demo@lifetrack.app' },
          password: { type: 'string', format: 'password', example: 'password123' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logged in successfully' },
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          amount: { type: 'number', example: 125.50 },
          type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
          category: { type: 'string', example: 'Food' },
          comment: { type: 'string', example: 'Obiad w restauracji' },
          date: { type: 'string', format: 'date-time' },
          userId: { type: 'integer', example: 1 }
        }
      },
      CreateTransactionRequest: {
        type: 'object',
        required: ['type', 'amount', 'category'],
        properties: {
          type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
          amount: { type: 'number', example: 45.00 },
          category: { type: 'string', example: 'Food' },
          comment: { type: 'string', example: 'Kawiarnia' },
          date: { type: 'string', format: 'date-time', example: '2026-10-19T10:00:00Z' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          name: { type: 'string', example: 'Kawiarnia' },
          type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
          color: { type: 'string', example: '#FF6384' },
          isDefault: { type: 'boolean', example: false }
        }
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', example: 'Siłownia' },
          type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
          color: { type: 'string', example: '#6366F1' }
        }
      },
      StatsResponse: {
        type: 'object',
        properties: {
          totalIncome: { type: 'number', example: 5000.00 },
          totalExpense: { type: 'number', example: 2150.50 },
          balance: { type: 'number', example: 2849.50 },
          transactionCount: { type: 'integer', example: 14 },
          categoryBreakdown: {
            type: 'object',
            additionalProperties: { type: 'number' },
            example: { Food: 650.00, Rent: 1200.00, Transport: 300.50 }
          }
        }
      }
    }
  },
  paths: {
    '/api/status': {
      get: {
        tags: ['System'],
        summary: 'Stan serwera i połączenia z bazą danych (Health Check)',
        responses: {
          200: {
            description: 'Serwer działa poprawnie'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Uwierzytelnianie (Auth)'],
        summary: 'Rejestracja nowego użytkownika',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
          }
        },
        responses: {
          201: { description: 'Użytkownik został pomyślnie utworzony', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Nieprawidłowe dane wejściowe' },
          409: { description: 'Użytkownik o takim adresie e-mail już istnieje' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Uwierzytelnianie (Auth)'],
        summary: 'Logowanie użytkownika i wydanie tokenu JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: { description: 'Pomyślnie zalogowano', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Błędny e-mail lub hasło' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Uwierzytelnianie (Auth)'],
        summary: 'Pobranie profilu aktualnie zalogowanego użytkownika',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profil użytkownika', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Brak tokenu lub token nieprawidłowy' }
        }
      }
    },
    '/api/transactions': {
      get: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Pobranie listy transakcji zalogowanego użytkownika',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filtruj po typie' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Limit pobieranych rekordów' },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data początkowa (RRRR-MM-DD)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data końcowa (RRRR-MM-DD)' }
        ],
        responses: {
          200: {
            description: 'Lista transakcji',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } } } }
          }
        }
      },
      post: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Dodanie nowej operacji (przychód lub wydatek)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionRequest' } }
          }
        },
        responses: {
          201: { description: 'Operacja została pomyślnie zarejestrowana' },
          400: { description: 'Brak wymaganych pól' }
        }
      }
    },
    '/api/transactions/export/csv': {
      get: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Eksport transakcji do pliku CSV z kodowaniem UTF-8 (Excel)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data początkowa (RRRR-MM-DD)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data końcowa (RRRR-MM-DD)' }
        ],
        responses: {
          200: {
            description: 'Plik CSV do pobrania',
            content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } }
          }
        }
      }
    },
    '/api/transactions/{id}': {
      put: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Edycja istniejącej operacji',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID operacji' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionRequest' } }
          }
        },
        responses: {
          200: { description: 'Operacja zaktualizowana pomyślnie' },
          400: { description: 'Nieprawidłowe dane' },
          404: { description: 'Operacja nie znaleziona' }
        }
      },
      delete: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Usunięcie wybranej transakcji',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID operacji' }
        ],
        responses: {
          200: { description: 'Operacja usunięta' },
          404: { description: 'Operacja nie znaleziona lub brak uprawnień' }
        }
      }
    },
    '/api/transactions/stats': {
      get: {
        tags: ['Transakcje (Transactions)'],
        summary: 'Statystyki finansowe, bilans oraz struktura wydatków na wykres',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data początkowa (RRRR-MM-DD)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Data końcowa (RRRR-MM-DD)' }
        ],
        responses: {
          200: {
            description: 'Podsumowanie bilansu i struktura kategorii',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } } }
          }
        }
      }
    },
    '/api/categories': {
      get: {
        tags: ['Kategorie (Categories)'],
        summary: 'Pobranie dostępnych kategorii przychodów i wydatków',
        responses: {
          200: {
            description: 'Lista kategorii domyślnych oraz własnych użytkownika'
          }
        }
      },
      post: {
        tags: ['Kategorie (Categories)'],
        summary: 'Utworzenie nowej własnej kategorii z kolorem dla wykresu',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryRequest' } }
          }
        },
        responses: {
          201: { description: 'Kategoria została pomyślnie utworzona' },
          409: { description: 'Kategoria o tej nazwie już istnieje' }
        }
      }
    },
    '/api/categories/{id}': {
      delete: {
        tags: ['Kategorie (Categories)'],
        summary: 'Usunięcie własnej kategorii użytkownika',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID kategorii' }
        ],
        responses: {
          200: { description: 'Kategoria usunięta' },
          404: { description: 'Nie można usunąć lub kategoria nie istnieje' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
