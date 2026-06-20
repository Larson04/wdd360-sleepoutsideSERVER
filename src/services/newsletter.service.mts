import newsletterModel from "../models/newsletter.model.mts";
import type { Newsletter } from "../models/types.mts";
import { NewsletterSchema } from "../database/json-schema.ts";
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";
import { validator } from "./utils.mts";
import type { JSONSchema7 } from "json-schema"

async function signup(email: string, name: string) {
    let newsletter: Newsletter | null = null;
    newsletter = await newsletterModel.getNewsletterEmail(email);
    if (newsletter) throw new EntityNotFoundError({message: "The email is already in the system", statusCode: 409 });
    const newSignup = {
        email,
        name,
    }
    validator(NewsletterSchema, newSignup)
    return newsletterModel.signupNewsletter(newSignup);
};

export default {
    signup
}
