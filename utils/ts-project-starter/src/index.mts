import "reflect-metadata";
import { config } from "dotenv";
import { container } from "tsyringe";

config();

// TODO register injectables

try {
  // TODO resolve services and execute business logic.
} catch (err) {
  console.error("An error occurred: ", err);
}
