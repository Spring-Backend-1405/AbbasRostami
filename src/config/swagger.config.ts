import swaggerJSDoc from "swagger-jsdoc";
// import { apiDocs } from "../docs";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API Documentation",
      version: "1.0.0",
      description:
        "Complete Blog API documentation with Authentication and Post management features.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // paths: apiDocs.paths,
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
