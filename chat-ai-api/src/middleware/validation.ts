import { ZodError } from "zod";

export function validate(schema: any) {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync(req.body);
      console.log("🚀 ~ return ~ await schema.parseAsync(req.body);:", await schema.parseAsync(req.body));
      next();
    }
    catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
