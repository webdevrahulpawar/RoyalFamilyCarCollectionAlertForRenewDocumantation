function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      const formatted = err?.issues?.map((i) => ({
        path: i.path?.join(".") || "",
        message: i.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: formatted || undefined });
    }
  };
}

module.exports = { validateBody };

