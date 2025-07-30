import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '📚 E-Book Rental API',
      version: '1.0.0',
      description: 'API τεκμηρίωση για την πλατφόρμα ενοικίασης βιβλίων. Περιλαμβάνει endpoints για χρήστες, βιβλία, παραγγελίες, καταστήματα, στατιστικά και λειτουργίες διαχειριστή.',
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Τοπικός server ανάπτυξης',
      },
      {
        url: 'https://your-production-domain.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'seller', 'admin'] },
            isVerified: { type: 'boolean' },
          },
        },
        UserDetails: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            street: { type: 'string' },
            region: { type: 'string' },
            postalCode: { type: 'string' },
            phone: { type: 'string' },
            floor: { type: 'string' },
            doorbell: { type: 'string' },
          },
        },
        Store: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            storeName: { type: 'string' },
            afm: { type: 'string' },
            address: { type: 'string' },
            postalCode: { type: 'string' },
            region: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            bookCategories: { type: 'array', items: { type: 'string' } },
          },
        },
        Book: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            author: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            description: { type: 'string' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            bookId: { type: 'string' },
            title: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            store: { $ref: '#/components/schemas/Store' },
            customer: { $ref: '#/components/schemas/User' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'delivered', 'declined'],
            },
            totalPrice: { type: 'number' },
            estimatedTime: { type: 'string' },
          },
        },
        DetailedOrder: {
          allOf: [{ $ref: '#/components/schemas/Order' }],
        },
      },
    },
    tags: [
      { name: 'Αυθεντικοποίηση', description: 'Εγγραφή, σύνδεση και προφίλ χρηστών' },
      { name: 'Χρήστης', description: 'Διαχείριση στοιχείων χρήστη και κωδικού' },
      { name: 'Καταστήματα', description: 'Δημιουργία και προβολή καταστημάτων' },
      { name: 'Βιβλία', description: 'Αναζήτηση, προβολή και διαχείριση βιβλίων' },
      { name: 'Μαζική Εισαγωγή', description: 'Εισαγωγή βιβλίων από Excel/JSON' },
      { name: 'Επικοινωνία', description: 'Μηνύματα επικοινωνίας με την υποστήριξη' },
      { name: 'Παραγγελίες', description: 'Διαχείριση και προβολή παραγγελιών' },
      { name: 'Πωλήσεις', description: 'Στατιστικά πωλήσεων πωλητή' },
      { name: 'Στατιστικά', description: 'Στατιστικά πωλητών και πελατών' },
      { name: 'Admin', description: 'Λειτουργίες διαχειριστή' },
      { name: 'Admin Παραγγελίες', description: 'Διαχείριση παραγγελιών από admin' },
    ],
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Καλύπτει όλα τα routes
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app, port) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {requestInterceptor: (req) => {
        if (authToken) {
          req.headers['Authorization'] = `Bearer ${authToken}`;
        }
        return req;
      },
      responseInterceptor: (res) => {
        try {
          const body = JSON.parse(res.text);
          if (body?.token) {
            authToken = body.token;
            console.log('✅ Token αποθηκεύτηκε αυτόματα:', authToken);
          }
        } catch (err) {}
        return res;
      },
      persistAuthorization: true, // Κρατάει το token όταν κάνεις refresh
      onComplete: () => {
        // Hook στο fetch για να δούμε αν έγινε login
        const origFetch = window.fetch;
        window.fetch = async (...args) => {
          const res = await origFetch(...args);
          try {
            const clone = res.clone();
            const json = await clone.json();
            if (json?.token && swaggerUiInstance) {
              swaggerUiInstance.preauthorizeApiKey('bearerAuth', `Bearer ${json.token}`);
              console.log('✅ Token αποθηκεύτηκε στο Authorize:', json.token);
            }
          } catch (e) {}
          return res}},
        customCss: `
        body {
        background-color: #121212 !important;
        color: #ffffff !important;
        }

        /* Όλα τα κείμενα σε λευκό */
        .swagger-ui, .swagger-ui * {
        color: #ffffff !important;
        }

        /* Επικεφαλίδες API */
        .swagger-ui .topbar {
        background-color: #1f1f1f !important;
        border-bottom: 2px solid #00f5ff !important;
        }
        .login-btn {
          background: #00f5ff; 
          color: black; 
          padding: 5px 10px; 
          border-radius: 6px; 
          margin-left: 10px; 
          cursor: pointer;
        }
        .swagger-ui .scheme-container {
        background-color: #1f1f1f !important;
        border-radius: 8px !important;
        padding: 10px !important;
        margin-bottom: 15px !important;
        border: 1px solid #00f5ff !important;
        }
        /* Servers dropdown */
        .swagger-ui select, 
        .swagger-ui .servers select {
        background: #121212 !important;
        color: #ffffff !important;
        border: 1px solid #00f5ff !important;
        border-radius: 6px !important;
        padding: 6px !important;
        }

        /* Authorize button */
        .swagger-ui .authorize {
        background-color: #121212 !important;
        color: #00f5ff !important;
        border: 1px solid #00f5ff !important;
        border-radius: 6px !important;
        }

        /* Authorize Dialog */
        .swagger-ui .dialog-ux {
        background-color: #1f1f1f !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        padding: 20px !important;
        }

        .swagger-ui .dialog-ux .modal-ux-header h3 {
        color: #00f5ff !important;
        }

        .swagger-ui .dialog-ux input {
        background-color: #121212 !important;
        color: #ffffff !important;
        border: 1px solid #00f5ff !important;
        border-radius: 6px !important;
        padding: 6px !important;
        }

        .swagger-ui .dialog-ux .authorize {
        background-color: #00f5ff !important;
        color: #000000 !important;
        font-weight: bold !important;
        border-radius: 6px !important;
        padding: 6px 14px !important;
        }

        .swagger-ui .dialog-ux .btn-done {
        background-color: #ff3b3b !important;
        color: #ffffff !important;
        border-radius: 6px !important;
        padding: 6px 14px !important;
        }

        /* Κουτιά operations */
        .swagger-ui .opblock {
        border-radius: 10px !important;
        margin-bottom: 15px !important;
        }

        /* POST */
        .swagger-ui .opblock.opblock-post {
        border: 1px solid #00ff9d !important;
        background: #002b24 !important;
        }

        /* GET */
        .swagger-ui .opblock.opblock-get {
        border: 1px solid #00c3ff !important;
        background: #001f33 !important;
        }

        /* PUT */
        .swagger-ui .opblock.opblock-put {
        border: 1px solid #ffcc00 !important;
        background: #332b00 !important;
        }

        /* DELETE */
        .swagger-ui .opblock.opblock-delete {
        border: 1px solid #ff3b3b !important;
        background: #330000 !important;
        }

        /* Εσωτερικά expanded blocks - στρογγυλεμένες γωνίες & padding */
        .swagger-ui .opblock-section, 
        .swagger-ui .opblock-body, 
        .swagger-ui table, 
        .swagger-ui .response-col_description__inner {
        border-radius: 8px !important;
        padding: 10px !important;
        }

        /* JSON blocks */
        .swagger-ui .model-box, .swagger-ui .opblock-body pre {
        background: #1a1a1a !important;
        border-radius: 8px !important;
        padding: 10px !important;
        color: #ffffff !important;
        }

        /* JSON syntax highlighting */
        .swagger-ui .highlight-code .hljs-string {
        color: #00ff9d !important;
        }
        .swagger-ui .highlight-code .hljs-number {
        color: #00c3ff !important;
        }
        .swagger-ui .highlight-code .hljs-attr {
        color: #ffcc00 !important;
            }
        `
        ,
      customSiteTitle: "📚 E-Book Rental API Docs",
       customJs: `
        function addLoginButton() {
          const topbar = document.querySelector('.swagger-ui .topbar');
          if (!topbar || document.querySelector('.login-btn')) return;
          
          const btn = document.createElement('button');
          btn.className = 'login-btn';
          btn.innerText = 'Login';
          btn.onclick = async () => {
            const email = prompt('Email:');
            if (!email) return;
            const password = prompt('Password:');
            if (!password) return;

            try {
              const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              });
              const data = await res.json();
              if (data?.token) {
                const ui = window.ui;
                ui.preauthorizeApiKey('bearerAuth', 'Bearer ' + data.token);
                alert('✅ Συνδέθηκες επιτυχώς!');
              } else {
                alert('❌ Αποτυχία login');
              }
            } catch (err) {
              alert('❌ Σφάλμα σύνδεσης');
            }
          };

          topbar.appendChild(btn);
        }

        setTimeout(addLoginButton, 1000);
      `
    })
  );

  console.log(`📄 Swagger docs διαθέσιμα στο http://localhost:${port}/api-docs`);
};