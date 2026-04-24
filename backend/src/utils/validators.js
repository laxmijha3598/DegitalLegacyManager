const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const createAssetSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["document", "credential", "media", "note"]),
  description: z.string().optional().default(""),
  visibility: z.enum(["private", "nominee_on_verified_death"]).optional(),
  credential: z
    .object({
      username: z.string().optional(),
      password: z.string().optional(),
      url: z.string().optional()
    })
    .optional()
});

const createNomineeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  relationship: z.string().optional().default("")
});

module.exports = {
  registerSchema,
  loginSchema,
  createAssetSchema,
  createNomineeSchema
};

