export const uploadSwagger = {
  paths: {
    "/api/uploads/editor-image": {
      post: {
        tags: ["Post"],
        summary: "Upload image for editor (Admin)",
        description:
          "Uploads an image to be used inside rich text editor content (CKEditor/TipTap). Returns the image URL to embed in HTML content.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description:
                      "Image file (JPG, PNG, WEBP) - Maximum 5MB",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image uploaded successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    url: "https://res.cloudinary.com/.../editor/image.jpg",
                  },
                },
              },
            },
          },
          400: { description: "No image file provided." },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },
  },
};
