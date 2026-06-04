import { Router } from "express";
import userRoutes from "./user.routes.mts";
import productRoutes from "./product.routes.mts";
import swaggerRoutes from "./swagger.routes.mts";

const router:Router = Router();

// The home page route
router.get("/", (req, res) => {
  res.json({ title: "API V1" });
});

// load products routes
router.use("/products", productRoutes);

// login routes
router.use("/users", userRoutes);

router.use(swaggerRoutes);


export default router;
